# LMS Frontend — Status & TODO

_Last updated: 2026-09-30. Open items live in the three TODO sections below; everything under **Archive** is a historical record. The Member/Librarian/Guest portals described there were deleted in the admin-only cleanup._

## Current shape

Single-admin app. Next.js 16 + custom `ui-lib` components on :3000. Login lives at **`/login`** (admin-only — any non-admin login is signed straight back out with an "Access restricted" message). Root `/` redirects to `/admin/dashboard`; the proxy (`src/proxy.ts`) bounces unauthenticated `/admin/*` requests to `/login?next=…`, and the admin layout adds a client-side role guard (the proxy only sees the session cookie, not the role).

**Routes (16):** `/admin/dashboard`, `users`, `catalog`, `copies`, `categories`, `authors`, `publishers`, `inventory`, `circulation`, `fines`, `reservations`, `notifications`, `audit`, `settings`, plus `/login`. Roles & Permissions, Branches, and Reports were deleted on 2026-09-30 (single admin; no backend endpoints; smaller real system > bigger fake one). Dashboard keeps the four live stat cards + Recent Activity; charts removed (`recharts` dependency dropped).

## Environment (how to run everything)

- **Backend** = `Arkad-baby/Library_Management_System`, cloned to `.real-backend/` (gitignored). Runs on :4000 via `cd .real-backend && npx tsx src/server.ts`.
- **Database** = local embedded Postgres on **:5433** (no Docker/installer needed). Start with `node .real-backend/.pgsetup.mjs` (binaries via `embedded-postgres`, data in `.real-backend/.pgdata/`). The repo's committed `.env` pointed at a **dead Supabase pooler** (`tenant/user not found` — project deleted or paused); original URL preserved as a comment in `.real-backend/.env`.
- **Frontend** = `cd frontend && npm run build && npm start` (or `npm run dev`).
- **Login:** `admin@library.com` / `admin123` (the GitHub seed only creates the admin; librarian/member seed accounts don't exist in that repo).

## Verified working (live walkthrough 2026-09-30)

- Login, category/author/publisher/book CRUD (linked), copies CRUD (duplicate barcode → 409)
- Borrow on behalf of student (double-borrow → 409), return (on time → no fine), **renew** (+14d, verified Oct 14 → Oct 28)
- Dashboard stats (after fixing the 500), all 18 frontend routes render, proxy + role guard behave
- Two backend bugs found & fixed locally (see Archive → Live walkthrough): dashboard `role: "STUDENT"` → `"MEMBER"`, and `POST /borrow/renew` added

---

## TODO — frontend

- [x] Book cover upload UI — button + preview added to the catalog edit dialog (2026-09-30)
- [x] Reports page and dashboard charts removed entirely (2026-09-30, superseding the same-day CSV rewire) — decision: everything visible must be real; `recharts` uninstalled. If rebuilt later, use real endpoints (e.g. borrows/month, fines collected)
- [ ] README with setup steps, env vars (`NEXT_PUBLIC_API_URL`), and admin credentials for delivery
- [ ] Empty states / validation pass on every page before delivery; seed realistic demo data if this is for a demo

## TODO — backend (send to collaborator)

- [x] `POST /borrow/renew` + dashboard `"MEMBER"` fix ported into `backend/` (main repo) and committed (2026-09-30)
- [x] `POST /reservation` accepts `userId` (admin reserve-on-behalf) and admins can cancel any reservation — in both backends (2026-09-30)
- [ ] **Push `backend/` to `origin/master`** — everything is committed locally; push is the remaining step
- [ ] **Rotate the leaked Supabase/SendGrid secrets at the providers** (Supabase project `fwfpixhzdsjziifczfzs` is dead anyway; JWT secrets already rotated locally in `.real-backend/.env`)
- [ ] `GET /fines` accept `?userId=` filter
- [ ] Optional: extend seed with demo books/copies/students so a fresh clone isn't empty

## TODO — delivery checklist

- [ ] Run the Postman collection (`LMS.json`) top-to-bottom against the running backend
- [ ] Walk the full story in the UI: category → author → book → copy → student → borrow → return late → fine appears → pay → dashboard numbers
- [ ] Move API URL + secrets to env vars; write the README; final build + lint

---

# Archive — historical sessions

> **Note:** sessions dated before 2026-09-30 describe the four-portal app (Admin / Librarian / Member / Guest). Those portals were deleted in the admin-only cleanup — login now lives at `/login` and only the Admin console remains. Claims below about librarian/member pages, member seed accounts, and member contexts are historical. `ReservationsContext` and `FinesContext` were removed; `PublicNavBar` too. Where a section contradicts the current state, the current state wins.

## Admin-Only Simplification + Catalog Pages (2026-09-30 session)

### Step 1 — single admin app (login moved to /login)
- [x] Deleted `/librarian` and `/member` apps and the `/guest` app except login
- [x] Created `src/app/login/page.jsx` — admin-only login; non-admin logins are signed straight back out with an "Access restricted" message
- [x] Root `/` now redirects to `/admin/dashboard`
- [x] `src/proxy.ts` protects `/admin` only, redirects to `/login?next=...`
- [x] Admin layout has a client-side role guard (proxy only sees the cookie, not the role) — non-admin sessions get routed to /login
- [x] TopBar + SignOutButton sign out to `/login?signedOut=1`
- [x] Removed `PublicNavBar`, `FinesContext`, `ReservationsContext` (only used by deleted portals); admin pages read fines/reservations via `useApiData` directly
- [x] Login page wraps itself in its own ToastProvider (guest layout is gone)
- [x] Kept the full sidebar per decision: existing pages stay (Branches/Roles/Reports/Inventory remain demo data until endpoints exist)

### New admin catalog pages (wired to real endpoints)
- [x] `/admin/categories` — CRUD via `/categories`
- [x] `/admin/authors` — CRUD via `/authors`
- [x] `/admin/publishers` — CRUD via `/publishers`
- [x] `/admin/copies` — pick a book, then CRUD its copies via `/copies` (barcode immutable on edit, status editable only on edit — matches backend validation enums)
- [x] Sidebar nav: added Copies, Categories, Authors, Publishers entries
- [x] `lib/backend.js` — added `copyToUi`, `listCopiesForBook`, `createCopy`, `updateCopy`, `deleteCopy`, `uploadBookCover` (multipart, auth header, no JSON content-type)
- [x] `npm run build` + `npm run lint` — clean

### Fines page (2026-09-30)
- [x] Added the missing **Pay** button next to Waive (backend `PATCH /fines/:id/pay` and `payFine()` existed but had no UI)

## Live walkthrough (2026-09-30, backend = Arkad-baby/Library_Management_System)
- [x] Cloned the real backend to `.real-backend/` (gitignored). Its committed `.env` pointed at a DEAD Supabase pooler (`tenant/user postgres.fwfp... not found`)
- [x] Local Postgres instead: `embedded-postgres` binaries on :5433 (`node .real-backend/.pgsetup.mjs`), db push + seed OK
- [x] Live API walkthrough, 11/11 after 2 backend fixes:
  - FIXED `GET /dashboard` 500 — `role: "STUDENT"` doesn't exist in the schema enum (ADMIN/MEMBER/LIBRARIAN) → changed to `"MEMBER"` in dashboard.service.ts
  - ADDED `POST /borrow/renew` (missing on GitHub backend; extends due +14d, verified live: Oct 14 → Oct 28)
- [x] Verified live: login, category/author/publisher/book CRUD, copies (duplicate barcode → 409), borrow (double-borrow → 409), return (on time → no fine), renew, dashboard stats
- [x] Frontend: all 18 routes render 200; `/`→admin/dashboard; proxy bounces unauthenticated /admin/* → /login
- [ ] Both backend fixes should be PR'd to the GitHub repo (tracked in TODO — backend above)

## Notifications API Sync (2026-09-22 session)

### GitHub repo audit
- [x] Compared remote GitHub repo modules against local backend — identified `notifications` module as the only missing API

### New files created (backend)
- [x] `src/modules/notifications/notification.validation.ts` — Zod schema for `sendTestEmailSchema` (`to`, `subject`, `message`)
- [x] `src/modules/notifications/notification.service.ts` — `sendNotification()` helper: creates DB record, sends email via SendGrid, updates status to SENT or FAILED
- [x] `src/modules/notifications/notification.controller.ts` — `getMyNotifications`, `getAllNotifications`, `sendTestEmail` controllers with pagination
- [x] `src/modules/notifications/notification.routes.ts` — 3 routes: `GET /me`, `GET /`, `POST /test`
- [x] `src/utils/email.ts` — `sendEmail()` utility using `@sendgrid/mail`

### Updated files (backend)
- [x] `src/routes/index.ts` — registered `notificationRoutes` at `/notifications`
- [x] `.env.example` — added `SENDGRID_API_KEY` and `EMAIL_FROM` vars
- [x] `API.md` — documented all 3 new notification endpoints

### New endpoints now available
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/notifications/me` | ✅ | Any |
| GET | `/api/notifications` | ✅ | ADMIN |
| POST | `/api/notifications/test` | ✅ | ADMIN |

### Still needed (frontend)
- [x] Remove "No API" amber banner from admin Notifications page — replaced with live data
- [x] Wire `GET /notifications/me` into the (then) member Notifications page — page since deleted
- [x] Wire `GET /notifications` into admin Notifications page
- [x] Wire `POST /notifications/test` into admin Notifications page (Send Test Email form)
- [ ] Add `SENDGRID_API_KEY` + `EMAIL_FROM` to local `.env` with real values

## API Fixes & Unused Endpoint Wiring (2026-08-15 session)

### Faulty API calls fixed (method / URL mismatches vs GitHub repo)
- [x] `listMyLoans` — fixed URL `/borrow/student/:id` → `/borrow/student/:id/history`
- [x] `payFine` — fixed method `POST` → `PATCH` (`PATCH /fines/:id/pay`)
- [x] `waiveFine` — fixed method `POST` → `PATCH` (`PATCH /fines/:id/waive`)
- [x] `cancelReservation` — fixed method + path `DELETE /reservation/:id` → `PATCH /reservation/:id/cancel`
- [x] `renewLoan` — `POST /borrow/renew` did not exist in the GitHub repo; call kept with a clear comment — **endpoint now added locally on 2026-09-30, still needs the PR**

### Unused backend endpoints wired
- [x] `GET /books/search?q=` — wired into catalog search bars (server-side search)
- [x] `GET /books/category/:category` — wired into genre filter
- [x] `GET /borrow/student/:id/current` — wired into member Home (page since deleted)
- [x] `GET /users/:id` — wired into admin Users Management "View details" modal
- [x] `GET /copies/:id` — `getCopyById()` added to `backend.js`
- [x] `POST /books/:id/cover` — available via `backend.js` service layer (UI still pending)

### New backend.js service functions added
- `searchBooks(q)`, `listBooksByCategory(category)`, `getCurrentLoan(userId)`, `getUserById(id)`, `getCopyById(id)`

## Full API Audit & Wiring (2026-08-11 session)

### API audit — cross-checked every backend route against frontend
- [x] `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- [x] `GET /books`, `GET /books/:id`, `POST /books`, `DELETE /books/:id`
- [x] `GET /copies/book/:id`, `POST /copies`, `PATCH /copies/:id`, `DELETE /copies/:id`
- [x] `GET /borrow`, `POST /borrow`, `POST /borrow/return`, `GET /borrow/student/:id`
- [x] `GET /fines`, `GET /fines/me`, `POST /fines/:id/pay`, `POST /fines/:id/waive`
- [x] `GET /reservation`, `GET /reservation/me`, `POST /reservation`, `DELETE /reservation/:id`
- [x] `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`
- [x] `GET /categories`, `GET /authors`, `POST /authors` (used internally in createBook/updateBook)
- [x] `GET /dashboard`

### Newly wired that session
- [x] `PATCH /books/:id` — Edit title modal in catalog (`updateBook`)
- [x] `GET /settings`, `PATCH /settings` — `SystemSettings.jsx` loads + saves `dailyFineRate` + `gracePeriodDays` live; fields not in backend schema marked read-only
- [x] `GET /borrow` (reused) — `AuditLogs.jsx` wired to real borrow history as audit trail
- [x] `GET /books` (reused, copy counts) — `InventoryStock.jsx` wired to live per-title copy counts

### Added to backend.js service layer
- [x] `/categories`, `/authors`, `/publishers` CRUD functions (now powering their own admin pages)
- [x] `listAuditLogs` — wraps borrow history into `{ time, user, action, ip }`
- [x] `listAllCopies` — aggregates per-book copy stats for inventory view

### No backend API exists for (frontend remains on demo data)
- Branches, Reports, Roles & Permissions, real audit trail (IP, admin actions)

### Known constraints (updated 2026-09-30)
- GitHub seed creates **only the admin** (`admin@library.com`/`admin123`) — earlier librarian/member seed accounts aren't in that repo's seed
- Frontend requires the backend at `http://localhost:4000/api` (set `NEXT_PUBLIC_API_URL` to override)

## Auth: Logout + Session Toasts (2026-08-11 session)
- [x] Confirmed backend `POST /api/auth/logout` exists (revokes refresh token server-side, verified live)
- [x] `AuthContext.logout()` calls `POST /auth/logout` (best-effort) before clearing local tokens/cookie
- [x] `TopBar.jsx` — user chip is a dropdown menu with name/email + Sign out
- [x] `SignOutButton.jsx` — shared component with confirm dialog (still used on admin Dashboard)
- [x] "Signed out" toast — login page shows it on `?signedOut=1`
- [x] "Signed in" welcome toast — login redirects with `?welcome=1`; `WelcomeToast.jsx` shows it and strips the param

## Backend Integration Map (2026-08-11) — historical
- [x] Backend cloned, `npm install` done; mapped API: base `http://localhost:4000/api`, CORS open, response shape `{ success, data, meta? }`
- [x] Route groups: `/auth`, `/books`, `/copies`, `/borrow`, `/users`, `/fines`, `/reservation`, `/categories`, `/authors`, `/publishers`, `/dashboard`, `/settings` (+ `/notifications` added 2026-09-22)
- [x] Backend tweaks made in the older local clone back then (optionalAuth, staff access relaxation, member self-pay, renew, isActive, extended seed) — **none of these are in the GitHub repo**; only the dashboard fix + renew were re-applied on 2026-09-30 (in `.real-backend/`, still unPR'd)

## Env Cleanup & Template (2026-08-11 session)
- [x] `.env` never tracked; `.gitignore` has `.env*` with `!.env.example` negation
- [x] `.env.example` created with all vars (DATABASE_URL, PORT, JWT secrets, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SENDGRID_API_KEY, EMAIL_FROM)
- [ ] Local frontend `.env` with real values — not needed while defaults point at localhost
- [ ] `git push` — no remote configured on this repo

## Member Portal — Build Plan (SUPERSEDED 2026-09-30 — portal deleted)
- [x] mock-data.js `CURRENT_MEMBER`; `ReservationsContext` + `FinesContext` (both since deleted)
- [x] Phase 1 — member nav + layout scaffold + `/member` redirect
- [x] Phase 2 — member home (scoped StatCards + Currently Borrowed)
- [x] Phase 3 — Search Catalog; Phase 4 — Book Details with Reserve
- [x] Phase 5 — My Loans; Phase 6 — My Reservations; Phase 7 — My Fines; Phase 8 — Payments
- [x] Phase 9 — Notifications; Phase 10 — Profile/Settings
- [x] Build verified (40 routes at the time)

## Backend / Prisma Doc (Part 2) — review only, superseded
- [x] Produced review + copy-paste blueprints (migration enum-rename check, Branches module, role-guard sweep, Notification Prefs upsert, Audit Logs wiring, idempotent seed)
- [ ] Blueprint execution tracked by collaborator; Branches module remains the main missing piece (Branch model exists in schema but has no routes)
