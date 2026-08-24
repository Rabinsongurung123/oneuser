# Library Management System API

**Base URL:** `http://localhost:4000/api`

All authenticated endpoints require the `Authorization: Bearer <token>` header.

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login and get tokens |
| POST | `/auth/logout` | No | Invalidate refresh token |
| POST | `/auth/refresh` | No | Get new access token |

**POST `/auth/login`**
```json
// Request
{ "email": "admin@library.com", "password": "admin123" }

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "...", "name": "Admin User", "email": "admin@library.com", "role": "ADMIN" }
  }
}
```

---

## Users

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/users` | ✅ | ADMIN |
| GET | `/users/:id` | ✅ | Any |
| POST | `/users` | ✅ | ADMIN |
| PATCH | `/users/:id` | ✅ | Any |
| DELETE | `/users/:id` | ✅ | ADMIN |

---

## Books

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/books` | ✅ | Any |
| GET | `/books/:id` | ✅ | Any |
| POST | `/books` | ✅ | ADMIN |
| PATCH | `/books/:id` | ✅ | ADMIN |
| DELETE | `/books/:id` | ✅ | ADMIN |
| POST | `/books/:id/cover` | ✅ | ADMIN |

---

## Copies

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/copies/book/:bookId` | ✅ | Any |
| GET | `/copies/:id` | ✅ | Any |
| POST | `/copies` | ✅ | ADMIN |
| PATCH | `/copies/:id` | ✅ | ADMIN |
| DELETE | `/copies/:id` | ✅ | ADMIN |

---

## Categories

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/categories` | ✅ | Any |
| GET | `/categories/:id` | ✅ | Any |
| POST | `/categories` | ✅ | ADMIN |
| PATCH | `/categories/:id` | ✅ | ADMIN |
| DELETE | `/categories/:id` | ✅ | ADMIN |

---

## Authors

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/authors` | ✅ | Any |
| GET | `/authors/:id` | ✅ | Any |
| POST | `/authors` | ✅ | ADMIN |
| PATCH | `/authors/:id` | ✅ | ADMIN |
| DELETE | `/authors/:id` | ✅ | ADMIN |

---

## Publishers

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/publishers` | ✅ | Any |
| GET | `/publishers/:id` | ✅ | Any |
| POST | `/publishers` | ✅ | ADMIN |
| PATCH | `/publishers/:id` | ✅ | ADMIN |
| DELETE | `/publishers/:id` | ✅ | ADMIN |

---

## Borrow

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/borrow` | ✅ | Any |
| POST | `/borrow/return` | ✅ | Any |
| GET | `/borrow` | ✅ | ADMIN |
| GET | `/borrow/student/:id/history` | ✅ | Any |
| GET | `/borrow/student/:id/current` | ✅ | Any |

---

## Fines

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/fines/me` | ✅ | Any |
| GET | `/fines` | ✅ | ADMIN |
| PATCH | `/fines/:id/pay` | ✅ | ADMIN |
| PATCH | `/fines/:id/waive` | ✅ | ADMIN |

---

## Reservations

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/reservation` | ✅ | Any |
| GET | `/reservation/me` | ✅ | Any |
| PATCH | `/reservation/:id/cancel` | ✅ | Any |
| GET | `/reservation` | ✅ | ADMIN |

---

## Dashboard

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/dashboard` | ✅ | ADMIN |

---

## Settings

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/settings` | ✅ | ADMIN |
| PATCH | `/settings` | ✅ | ADMIN |

---

## Test Accounts

All accounts use password: `admin123`

| Role | Email | Role Enum |
|------|-------|-----------|
| Admin | admin@library.com | ADMIN |
| Librarian | librarian@library.com | LIBRARIAN |
| Member | member@library.com | MEMBER |
