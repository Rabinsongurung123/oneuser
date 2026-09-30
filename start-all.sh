#!/usr/bin/env bash
# start-all.sh — boot the whole LMS dev stack with one command.
#
# Usage:
#   ./start-all.sh            # start anything that isn't already running
#   ./start-all.sh stop       # stop postgres, backend, frontend
#   ./start-all.sh status     # show what's up
#   ./start-all.sh logs <pg|backend|frontend>   # tail a service log
#   ./start-all.sh --dev      # force frontend dev mode (npm run dev)
#   ./start-all.sh --open     # open http://localhost:3000 in the browser
#
# Services:
#   postgres  :5433  (embedded, data in .real-backend/.pgdata)
#   backend   :4000  (.real-backend, Express + Prisma)
#   frontend  :3000  (Next.js; `npm start` if a build exists, else `npm run dev`)
#
# Stopping works by port (finds the listener via netstat/lsof), so it also
# cleans up instances that were started manually outside this script.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RB="$SCRIPT_DIR/.real-backend"
FE="$SCRIPT_DIR/frontend"
LOGS="$SCRIPT_DIR/.logs"
PG_PORT=5433
API_PORT=4000
WEB_PORT=3000

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ON_WINDOWS=1 ;;
  *) ON_WINDOWS=0 ;;
esac

OPEN_BROWSER=0
FRONTEND_DEV=0
ACTION="start"
for arg in "$@"; do
  case "$arg" in
    --dev) FRONTEND_DEV=1 ;;
    --open) OPEN_BROWSER=1 ;;
    start|stop|status|restart|logs) ACTION="$arg" ;;
    pg|backend|frontend) LOG_TARGET="$arg" ;;
    *)
      echo "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

mkdir -p "$LOGS"

# ---------------------------------------------------------------- helpers

port_open() {
  node -e "
    const net = require('net');
    const s = net.connect({ port: Number(process.argv[1]), host: '127.0.0.1' });
    s.setTimeout(1500);
    s.on('connect', () => { s.destroy(); process.exit(0); });
    s.on('timeout', () => { s.destroy(); process.exit(1); });
    s.on('error', () => process.exit(1));
  " "$1" >/dev/null 2>&1
}

# Kill whatever process is listening on a TCP port (dev-only convenience).
kill_port() {
  local port="$1"
  if [ "$ON_WINDOWS" = 1 ]; then
    local pids
    pids="$(netstat -ano | grep ":$port" | grep LISTENING | awk '{print $5}' | sort -u)"
    for p in $pids; do
      taskkill //F //T //PID "$p" >/dev/null 2>&1
    done
    [ -n "$pids" ] && return 0 || return 1
  else
    command -v lsof >/dev/null 2>&1 || return 1
    local pids
    pids="$(lsof -ti tcp:"$port" 2>/dev/null | sort -u)"
    for p in $pids; do
      kill "$p" 2>/dev/null
    done
    [ -n "$pids" ] && return 0 || return 1
  fi
}

wait_port() { # $1=port $2=timeout_seconds $3=label
  local waited=0
  while ! port_open "$1"; do
    sleep 1
    waited=$((waited + 1))
    if [ "$waited" -ge "$2" ]; then
      echo "ERROR: $3 did not come up on port $1 within ${2}s"
      echo "----- last log lines -----"
      tail -n 20 "$LOGS/$4" 2>/dev/null
      return 1
    fi
  done
  return 0
}

wait_url() { # $1=url $2=timeout_seconds $3=label $4=logfile
  local waited=0
  while ! curl -s -o /dev/null --max-time 2 "$1"; do
    sleep 1
    waited=$((waited + 1))
    if [ "$waited" -ge "$2" ]; then
      echo "ERROR: $3 not responding at $1 within ${2}s"
      echo "----- last log lines -----"
      tail -n 20 "$LOGS/$4" 2>/dev/null
      return 1
    fi
  done
  return 0
}

log_file_for() {
  case "$1" in
    pg) echo "$LOGS/pg.log" ;;
    backend) echo "$LOGS/backend.log" ;;
    frontend) echo "$LOGS/frontend.log" ;;
  esac
}

# Spawn a long-running service fully detached from this shell.
# Windows: `cmd start` a generated .cmd wrapper (survives terminal close,
# returns immediately, no console-handle coupling)
# Unix: classic nohup + disown
spawn_detached() { # $1=workdir $2=command $3=logfile
  if [ "$ON_WINDOWS" = 1 ]; then
    local bat win_dir win_log win_bat
    win_dir="$(cygpath -w "$1")"
    win_log="$(cygpath -w "$3")"
    rm -f "$LOGS"/spawn-*.cmd
    bat="$LOGS/spawn-$$.cmd"
    printf '@echo off\r\ncd /d "%s"\r\n%s > "%s" 2>&1\r\n' "$win_dir" "$2" "$win_log" > "$bat"
    win_bat="$(cygpath -w "$bat")"
    cmd //c start "" //min "$win_bat" >/dev/null 2>&1
  else
    (
      cd "$1" &&
      nohup bash -c "$2" >"$3" 2>&1 </dev/null &
      disown
    )
  fi
}

# ---------------------------------------------------------------- actions

do_status() {
  local pg=0 api=0 web=0
  port_open $PG_PORT && pg=1
  port_open $API_PORT && api=1
  port_open $WEB_PORT && web=1
  echo "postgres : $([ $pg = 1 ] && echo 'running  ✓' || echo 'down')"
  echo "backend  : $([ $api = 1 ] && echo 'running  ✓' || echo 'down')   (http://localhost:$API_PORT/health)"
  echo "frontend : $([ $web = 1 ] && echo 'running  ✓' || echo 'down')   (http://localhost:$WEB_PORT)"
  if [ $pg = 1 ] && [ $api = 1 ] && [ $web = 1 ]; then
    echo ""
    echo "Login: admin@library.com / admin123"
  fi
}

do_stop() {
  echo "Stopping backend..."
  kill_port $API_PORT && echo "  backend stopped" || echo "  backend was not running"

  echo "Stopping frontend..."
  kill_port $WEB_PORT && echo "  frontend stopped" || echo "  frontend was not running"

  echo "Stopping postgres..."
  # Prefer a clean shutdown via pg_ctl from the embedded binaries.
  local pgctl=""
  if [ -d "$RB/.pgdata" ]; then
    pgctl="$(ls "$RB"/node_modules/@embedded-postgres/*/native/bin/pg_ctl* 2>/dev/null | head -n 1 || true)"
  fi
  if [ -n "$pgctl" ]; then
    "$pgctl" -D "$RB/.pgdata" -m fast stop >/dev/null 2>&1 || true
  fi
  # Fall back to a port kill if something is still listening.
  if port_open $PG_PORT; then
    kill_port $PG_PORT || true
  fi
  if port_open $PG_PORT; then
    echo "  WARNING: postgres still listening on $PG_PORT"
  else
    echo "  postgres stopped"
  fi
}

start_postgres() {
  if port_open $PG_PORT; then
    echo "postgres  : already running on :$PG_PORT"
    return 0
  fi
  if [ ! -d "$RB" ]; then
    echo "ERROR: $RB not found — the backend clone is required"
    return 1
  fi
  echo "postgres  : starting on :$PG_PORT (first boot can take ~30s)..."
  spawn_detached "$RB" "node .pgsetup.mjs" "$LOGS/pg.log"
  wait_port $PG_PORT 120 postgres pg.log || return 1
  echo "postgres  : ready ✓"
}

start_backend() {
  if port_open $API_PORT; then
    echo "backend   : already running on :$API_PORT"
    return 0
  fi
  if [ ! -d "$RB/node_modules" ]; then
    echo "backend   : installing dependencies (one-time)..."
    (cd "$RB" && npm install --no-audit --no-fund >/dev/null)
  fi
  if [ ! -d "$RB/node_modules/.prisma" ]; then
    echo "backend   : generating prisma client..."
    (cd "$RB" && npx prisma generate >/dev/null)
  fi
  echo "backend   : starting on :$API_PORT..."
  spawn_detached "$RB" "npx tsx src/server.ts" "$LOGS/backend.log"
  wait_url "http://localhost:$API_PORT/health" 60 backend backend.log || return 1
  echo "backend   : ready ✓  (http://localhost:$API_PORT/health)"
}

start_frontend() {
  if port_open $WEB_PORT; then
    echo "frontend  : already running on :$WEB_PORT"
    return 0
  fi
  if [ ! -d "$FE/node_modules" ]; then
    echo "frontend  : installing dependencies (one-time)..."
    (cd "$FE" && npm install --no-audit --no-fund >/dev/null)
  fi
  local mode="start"
  if [ "$FRONTEND_DEV" = 1 ] || [ ! -f "$FE/.next/BUILD_ID" ]; then
    mode="run dev"
  fi
  echo "frontend  : starting on :$WEB_PORT (npm $mode)..."
  spawn_detached "$FE" "npm $mode" "$LOGS/frontend.log"
  wait_url "http://localhost:$WEB_PORT" 90 frontend frontend.log || return 1
  echo "frontend  : ready ✓  (http://localhost:$WEB_PORT)"
}

do_start() {
  echo "=== Starting LMS stack ==="
  start_postgres || exit 1
  start_backend || exit 1
  start_frontend || exit 1

  echo ""
  do_status

  if [ "$OPEN_BROWSER" = 1 ]; then
    if [ "$ON_WINDOWS" = 1 ]; then
      cmd //c start "http://localhost:$WEB_PORT" >/dev/null 2>&1
    elif command -v open >/dev/null 2>&1; then
      open "http://localhost:$WEB_PORT"
    elif command -v xdg-open >/dev/null 2>&1; then
      xdg-open "http://localhost:$WEB_PORT"
    fi
  fi

  echo ""
  echo "Logs: $LOGS/  (./start-all.sh logs backend|frontend|pg)"
  echo "Stop: ./start-all.sh stop"
}

# ---------------------------------------------------------------- dispatch

case "$ACTION" in
  start)
    do_start
    ;;
  stop)
    do_stop
    ;;
  restart)
    do_stop
    echo ""
    do_start
    ;;
  status)
    do_status
    ;;
  logs)
    target="${LOG_TARGET:-}"
    if [ -z "$target" ]; then
      echo "Usage: $0 logs <pg|backend|frontend>"
      exit 1
    fi
    exec tail -n 50 -f "$(log_file_for "$target")"
    ;;
esac
