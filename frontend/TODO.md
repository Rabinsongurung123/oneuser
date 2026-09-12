# Member Portal — Build Plan

## Shared Foundations
- [x] mock-data.js: add `CURRENT_MEMBER` constant
- [x] Create `src/components/ui-lib/ReservationsContext.jsx` (mirror LoansContext)
- [x] Create `src/components/ui-lib/FinesContext.jsx` (mirror LoansContext) — fixes cross-page Fines↔Payments bug

## Phase 1 — Nav + Layout Scaffold
- [x] Create `src/app/member/nav.js` (Home, Search Catalog, My Loans, My Reservations, My Fines, Payments, Notifications, Profile/Settings)
- [x] Create `src/app/member/layout.jsx` (ToastProvider > LoansProvider > ReservationsProvider)
- [x] Create `src/app/member/page.jsx` (redirect to /member/home)

## Phase 2 — Home
- [x] `src/app/member/home/` (4 CURRENT_MEMBER-scoped StatCards + "Currently Borrowed" card list)
- [x] `Home.jsx` reads fines from `useFines()` so "Fines Owed" stays in sync

## Phase 3 — Search Catalog
- [x] `src/app/member/catalog/` (search/filter, no management actions, rows are Links)

## Phase 4 — Book Details
- [x] `src/app/member/catalog/[call]/page.jsx` (availability + branch breakdown + Reserve button)

## Phase 5 — My Loans
- [x] `src/app/member/loans/` (filter to CURRENT_MEMBER, self-service Renew)

## Phase 6 — My Reservations
- [x] `src/app/member/reservations/` (filter to CURRENT_MEMBER, Cancel + ConfirmDialog)

## Phase 7 — My Fines
- [x] `src/app/member/fines/` (unpaid only, Pay + ConfirmDialog, adds paidDate)
- [x] `MyFines.jsx` uses `useFines()` instead of local useState (shared state)

## Phase 8 — Payments
- [x] `src/app/member/payments/` (paid-only read-only history)
- [x] `Payments.jsx` reads from `useFines()` so paid fines appear

## Phase 9 — Notifications
- [x] `src/app/member/notifications/` (personal toggle list)

## Phase 10 — Profile / Settings
- [x] `src/app/member/settings/` (controlled form from CURRENT_MEMBER)

## Verify
- [x] Run `npm run build` to confirm no errors — build passed, 40 routes compiled successfully

## Env Cleanup & Template (2026-08-11 session)
- [x] Verified `.env` was never tracked and already covered by `.gitignore` (`.env*` pattern) — `git rm --cached .env` not needed (Step 1.3)
- [x] Added `.env` to `.gitignore` near the top, before Dependencies (Step 1.4)
- [x] Added `!.env.example` negation so the template stays committable despite `.env*`
- [x] Created `.env.example` with all 8 vars (DATABASE_URL, PORT, JWT_ACCESS/REFRESH_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL) (Step 1.5)
- [x] Committed `.gitignore` + `.env.example` as `fb8119d` (Step 1.6)
- [ ] Local `.env` with real secrets — blocked: values not provided yet (Step 1.2)
- [ ] `git push` — blocked: no remote configured on this repo
- [x] History scrub (git filter-repo) — NOT needed: `.env` never committed; only 2 commits in history; no remote (Step 1.7)

## Backend / Prisma Doc (Part 2) — review only, nothing implemented
- [ ] Phases 1–7 NOT executed here: repo has no Prisma/Express/backend — frontend mock-data app only (no `prisma/`, no `src/modules/`, no `src/routes/`)
- [x] Produced review + copy-paste blueprints: migration enum-rename check (Ph 2), Branches module (Ph 3), role-guard sweep (Ph 4), Notification Prefs upsert pattern (Ph 5), Audit Logs wiring + coverage recipe (Ph 6), idempotent seed data (Ph 7)
- [ ] Blocked on: backend repo URL or local clone to execute for real

## Backend Integration Map (frontend ↔ Library_Management_System) — IMPLEMENTED 2026-08-11
- [x] Backend cloned to `LM/Library_Management_System` (repo: Arkad-baby/Library_Management_System), `npm install` done (201 pkgs, 0 vulns)
- [x] Mapped API: base `http://localhost:4000/api`, CORS open (`cors()`), response shape `{ success, data, meta? }`
- [x] Route groups: `/auth`, `/books`, `/copies`, `/borrow`, `/users`, `/fines`, `/reservation`, `/categories`, `/authors`, `/publishers`, `/dashboard`, `/settings`
- [x] `GET /api/books` supports `?search=` + pagination — matches Guest catalog needs

### Backend changes (in `LM/Library_Management_System`)
- [x] Added `optionalAuth` middleware — public reads (`GET /books(/:id)`, `/categories`, `/authors`, `/publishers`) now work without login; writes stay role-gated
- [x] Relaxed staff access: `GET /users` + `POST/PATCH/DELETE /users` → ADMIN + LIBRARIAN; `GET /reservation` → ADMIN + LIBRARIAN; staff can cancel any waiting reservation
- [x] Members can pay their own fines (`POST /fines/:id/pay` now ownership-checked)
- [x] Fixed two 500 bugs: `GET /fines` and `GET /dashboard` included a non-existent `book` relation on `Borrow` (now via `copy.book`)
- [x] Added `POST /borrow/renew` (extend due date +14d, member can renew own loans)
- [x] Users API now returns `isActive` so Suspend/Activate works
- [x] Extended `seed.ts` (idempotent): 10 demo books + copies, 5 users, borrows, fines, reservations
- [x] Verified live: migrations applied, seed ran, server on :4000, all endpoints smoke-tested via curl

### Frontend changes (this repo)
- [x] `src/lib/api.js` — auto token refresh on 401 (silent, uses stored refresh token)
- [x] `src/lib/backend.js` — service layer + response mappers for books/loans/fines/reservations/users/dashboard
- [x] `useApiData` hook + `DemoBanner` — every wired page loads from the API and falls back to demo data (with banner) when the backend is offline
- [x] Member contexts (`Loans`/`Fines`/`Reservations`) now API-backed and scope-aware (member = own data, staff = all)
- [x] Catalog wired: guest, member, librarian, admin (list + detail by id/isbn, Add/Remove title with copies)
- [x] Loans wired: checkout (resolves member+title → `POST /borrow`), check-in (`POST /borrow/return`), renewals (`POST /borrow/renew`), admin circulation
- [x] Fines wired: member pay (`POST /fines/:id/pay`), staff waive (`POST /fines/:id/waive`), payments history
- [x] Reservations wired: member reserve/cancel (`POST`/`DELETE /reservation`), staff queue (view + cancel)
- [x] Users wired: librarian members + admin users (register, suspend/activate, delete)
- [x] Dashboards wired: member home, librarian, admin (stat cards + recent activity from `/dashboard`; charts remain illustrative demo data)
- [x] `npm run build` + `npm run lint` — clean

### Still on mock data (no backend endpoint exists yet)
- Branches (`/branches` endpoint + Branch model not in backend), inventory, reports, notifications, audit logs, roles, settings

### Known constraints
- Backend user list is MEMBER-only (no staff CRUD via `/users`) — admin Users page manages members
- Frontend requires the backend at `http://localhost:4000/api` (set `NEXT_PUBLIC_API_URL` to override)
- Seed accounts: `admin@library.com/admin123`, `librarian@library.com/librarian123`, `member@library.com/member123`

## Auth: Logout + Session Toasts (2026-08-11 session)
- [x] Confirmed backend `POST /api/auth/logout` exists (revokes refresh token server-side, verified live)
- [x] `AuthContext.logout()` now calls `POST /auth/logout` (best-effort) before clearing local tokens/cookie
- [x] `TopBar.jsx` — user chip is now a dropdown menu with name/email + Sign out (all portals)
- [x] Member Settings page — added "Session" card with Sign out + confirmation dialog
- [x] `SignOutButton.jsx` — shared component on all three dashboards (member home, librarian, admin) with confirm dialog
- [x] "Signed out" confirmation toast — login page shows it on `?signedOut=1` (guest layout now has ToastProvider)
- [x] "Signed in" welcome-back toast — login redirects to `<home>?welcome=1`; `WelcomeToast.jsx` shows "Signed in — welcome back, {name}!" on each dashboard and strips the param
- [x] `npm run build` + `npm run lint` — clean

## Member Dashboard CSS (2026-08-11 session)
- [x] Organized member dashboard to match librarian/admin layout (stat row + chart cards + list cards)
- [x] Polished CSS while keeping the matching structure:
  - `MemberStat` — soft-tinted icon chips, hover lift + shadow, accent bar slide-in
  - Upcoming Returns bar chart (rounded sage bars, dashed grid, dark custom tooltip)
  - Loan Status donut chart with center total + color-coded legend
  - Row hover states (Currently Borrowed + Needs Attention lists), footer summary strip
- [x] `npm run build` + `npm run lint` — clean

## Full API Audit & Wiring (2026-08-11 session)

### API audit — cross-checked every backend route (Arkad-baby/Library_Management_System) against frontend

#### Already wired (confirmed working)
- [x] `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- [x] `GET /books`, `GET /books/:id`, `POST /books`, `DELETE /books/:id`
- [x] `GET /copies/book/:id`, `POST /copies`, `PATCH /copies/:id`, `DELETE /copies/:id`
- [x] `GET /borrow`, `POST /borrow`, `POST /borrow/return`, `GET /borrow/student/:id`
- [x] `GET /fines`, `GET /fines/me`, `POST /fines/:id/pay`, `POST /fines/:id/waive`
- [x] `GET /reservation`, `GET /reservation/me`, `POST /reservation`, `DELETE /reservation/:id`
- [x] `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`
- [x] `GET /categories` (used internally in createBook/updateBook)
- [x] `GET /authors`, `POST /authors` (used internally in createBook/updateBook)
- [x] `GET /dashboard`

#### Newly wired this session
- [x] `PATCH /books/:id` — Edit title modal added to admin + librarian catalog (`updateBook` in backend.js)
- [x] `GET /settings`, `PATCH /settings` — `SystemSettings.jsx` now loads + saves `dailyFineRate` + `gracePeriodDays` live; fields not in backend schema (libraryName, timezone, loanDuration, maxFine) are clearly marked read-only
- [x] `GET /borrow` (reused) — `AuditLogs.jsx` wired to real borrow history as audit trail; shows user, action, date
- [x] `GET /books` (reused, copy counts) — `InventoryStock.jsx` wired to live per-title copy counts (total, checked-out, lost, low-stock); adapts columns when live vs mock

#### Added to backend.js service layer (ready for future UI pages)
- [x] `listCategories`, `createCategory`, `updateCategory`, `deleteCategory` — `/categories` CRUD
- [x] `listAuthors`, `createAuthor`, `updateAuthor`, `deleteAuthor` — `/authors` CRUD
- [x] `listPublishers`, `createPublisher`, `updatePublisher`, `deletePublisher` — `/publishers` CRUD
- [x] `listAuditLogs` — wraps borrow history into `{ time, user, action, ip }` shape
- [x] `listAllCopies` — aggregates per-book copy stats for inventory view

#### No-API banners added (amber, honest — resets on refresh)
- [x] Branches — no `/branches` endpoint or model in backend
- [x] Reports — no `/reports` endpoint in backend
- [x] Notifications — no `/notifications` endpoint in backend
- [x] Roles & Permissions — no `/roles` endpoint in backend

### Known gap — requires backend fix
- [ ] `POST /borrow/renew` — exists only in local clone (`LM/Library_Management_System`), NOT in GitHub repo (`Arkad-baby/Library_Management_System`); frontend calls it from 3 places (admin circulation, librarian renewals, member loans); will 404 on a fresh clone — needs to be committed and pushed to the repo

### No backend API exists for (frontend remains on mock data)
- Branches, Reports, Notification Templates, Roles & Permissions, Audit (real audit trail — IP, admin actions, etc.)

### Build verification
- [x] `npm run build` — clean, exit 0, all 40+ routes compiled

## API Fixes & Unused Endpoint Wiring (2026-08-15 session)

### Faulty API calls fixed (method / URL mismatches vs GitHub repo)
- [x] `listMyLoans` — fixed URL `/borrow/student/:id` → `/borrow/student/:id/history`
- [x] `payFine` — fixed method `POST` → `PATCH` (`PATCH /fines/:id/pay`)
- [x] `waiveFine` — fixed method `POST` → `PATCH` (`PATCH /fines/:id/waive`)
- [x] `cancelReservation` — fixed method + path `DELETE /reservation/:id` → `PATCH /reservation/:id/cancel`
- [x] `renewLoan` — `POST /borrow/renew` does not exist in the GitHub repo; left the call with a clear comment; LoansContext falls back gracefully when it throws

### Unused backend endpoints wired
- [x] `GET /books/search?q=` — wired into guest, member, admin, librarian catalog search bars (server-side search replaces client-side JS filter on keystroke)
- [x] `GET /books/category/:category` — wired into same 4 catalogs; fires when a genre filter is selected
- [x] `GET /borrow/student/:id/current` — wired into member Home; `getCurrentLoan()` fetches the live currently-borrowed book and renders it highlighted at the top of the "Currently Borrowed" card
- [x] `GET /users/:id` — wired into admin Users Management; "View details" row menu option calls `getUserById()` and opens a detail modal
- [x] `GET /copies/:id` — `getCopyById()` added to `backend.js` service layer (utility, no dedicated UI page needed)
- [x] `POST /books/:id/cover` — available via `backend.js` service layer for future UI use (no UI page built yet)

### New backend.js service functions added
- `searchBooks(q)` — `GET /books/search?q=`
- `listBooksByCategory(category)` — `GET /books/category/:category`
- `getCurrentLoan(userId)` — `GET /borrow/student/:id/current`
- `getUserById(id)` — `GET /users/:id`
- `getCopyById(id)` — `GET /copies/:id`

### Build verification
- [x] `npm run build` — clean, exit 0, all 40+ routes compiled
