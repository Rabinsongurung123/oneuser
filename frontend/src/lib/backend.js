// Service layer for the Library_Management_System backend.
// Returns UI-shaped data; throws on failure so callers can fall back to demo data.

import api from "./api";

const DATE = (d) => (d ? String(d).slice(0, 10) : null);
const money = (n) => Number(n ?? 0);

// ---------------------------------------------------------------- books

export function bookToUi(b) {
  const authors = (b.authors || [])
    .map((a) => a.author?.name)
    .filter(Boolean)
    .join(", ");
  const copies = b.copies || [];
  return {
    id: b.id,
    call: b.isbn || b.id,
    title: b.title,
    author: authors || "Unknown author",
    genre: b.category?.name || "—",
    year: b.createdAt ? new Date(b.createdAt).getFullYear() : "",
    copies: b.totalCopies ?? copies.length,
    available: b.availableCopies ?? copies.filter((c) => c.status === "AVAILABLE").length,
    desc: b.description || "",
    shelves: [],
  };
}

export async function listBooks() {
  const res = await api("/books?per_page=100");
  return (res.data || []).map(bookToUi);
}

/** Server-side full-text search using GET /books/search?q= */
export async function searchBooks(q) {
  if (!q || !q.trim()) return listBooks();
  const res = await api(`/books/search?q=${encodeURIComponent(q.trim())}&per_page=100`);
  return (res.data || []).map(bookToUi);
}

/** Filter books by category name using GET /books/category/:category */
export async function listBooksByCategory(category) {
  if (!category) return listBooks();
  const res = await api(`/books/category/${encodeURIComponent(category)}?per_page=100`);
  return (res.data || []).map(bookToUi);
}

export async function getBook(key) {
  try {
    const res = await api(`/books/${encodeURIComponent(key)}`);
    if (res?.data) return bookToUi(res.data);
  } catch {
    // not found by id — try an isbn search
  }
  const list = await api(`/books?search=${encodeURIComponent(key)}&per_page=100`);
  const found =
    (list.data || []).find((b) => b.isbn === key || b.id === key) || (list.data || [])[0];
  if (found) return bookToUi(found);
  throw new Error("Book not found");
}

async function resolveCategory(name) {
  const cats = (await api("/categories?per_page=100")).data || [];
  return (
    cats.find((c) => c.name.toLowerCase() === String(name || "").toLowerCase()) ||
    cats[0] ||
    null
  );
}

async function resolveAuthor(name) {
  if (!name || !String(name).trim()) return null;
  const clean = String(name).trim();
  const authors = (await api(`/authors?search=${encodeURIComponent(clean)}&per_page=5`)).data || [];
  let author = authors.find((a) => a.name.toLowerCase() === clean.toLowerCase());
  if (!author) {
    try {
      author = (await api("/authors", { method: "POST", body: { name: clean } })).data;
    } catch {
      author = null; // librarian may lack author-create permission
    }
  }
  return author;
}

export async function createBook({ title, isbn, description, genre, author, copies, available }) {
  const category = await resolveCategory(genre);
  if (!category) throw new Error("No matching category on the backend yet");

  const authorRec = await resolveAuthor(author);
  const body = {
    title,
    isbn,
    description: description || "",
    categoryId: category.id,
    ...(authorRec ? { authorIds: [authorRec.id] } : {}),
  };
  const book = (await api("/books", { method: "POST", body })).data;

  const count = Math.max(0, Number(copies) || 0);
  const avail = Math.min(Math.max(0, Number(available) || 0), count);
  const stamp = Date.now();
  for (let i = 0; i < count; i++) {
    const created = (
      await api("/copies", {
        method: "POST",
        body: {
          bookId: book.id,
          barcode: `BC-${stamp}-${i + 1}`,
          condition: "GOOD",
        },
      })
    ).data;
    if (i >= avail) {
      await api(`/copies/${created.id}`, { method: "PATCH", body: { status: "CHECKED_OUT" } });
    }
  }

  return bookToUi(book);
}

export async function deleteBook(id) {
  const copies = (await api(`/copies/book/${id}`)).data || [];
  for (const c of copies) {
    try {
      await api(`/copies/${c.id}`, { method: "DELETE" });
    } catch {
      // copy may be checked out; the book delete will surface it
    }
  }
  await api(`/books/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- loans

function loanStatus(l) {
  if (l.status === "RETURNED") return "Returned";
  const overdue = l.status === "OVERDUE" || (l.dueDate && new Date(l.dueDate) < new Date());
  return overdue ? "Overdue" : "On time";
}

export function loanToUi(l) {
  const book = l.copy?.book || {};
  return {
    id: l.id,
    member: l.user?.name || "—",
    userId: l.user?.id || l.userId,
    title: book.title || "—",
    bookId: book.id,
    copyId: l.copyId,
    checked: DATE(l.borrowDate),
    due: DATE(l.dueDate),
    status: loanStatus(l),
  };
}

export async function listLoans() {
  const res = await api("/borrow?per_page=100");
  return (res.data || []).map(loanToUi);
}

export async function listMyLoans(userId) {
  const res = await api(`/borrow/student/${encodeURIComponent(userId)}/history`);
  return (res.data || []).map(loanToUi);
}

/** Get the single book a member currently has checked out — GET /borrow/student/:id/current */
export async function getCurrentLoan(userId) {
  const res = await api(`/borrow/student/${encodeURIComponent(userId)}/current`);
  if (!res.data) return null;
  return loanToUi(res.data);
}

export async function createLoan({ userId, bookId, dueDate }) {
  const body = { userId, bookId };
  if (dueDate) body.dueDate = new Date(dueDate).toISOString();
  return (await api("/borrow", { method: "POST", body })).data;
}

export async function returnLoan(borrowId) {
  await api("/borrow/return", { method: "POST", body: { borrowId } });
}

export async function renewLoan(borrowId) {
  // NOTE: POST /borrow/renew does not exist in the GitHub backend repo.
  // This call will fail until the backend adds the endpoint.
  // Callers fall back to mock behaviour via LoansContext when the API throws.
  await api("/borrow/renew", { method: "POST", body: { borrowId } });
}

export async function findUserByName(name) {
  const res = await api(`/users?search=${encodeURIComponent(name)}&per_page=5`);
  const rows = res.data || [];
  return (
    rows.find((u) => u.name.toLowerCase() === String(name).toLowerCase()) ||
    rows[0] ||
    null
  );
}

export async function findBookByTitle(title) {
  const res = await api(`/books?search=${encodeURIComponent(title)}&per_page=5`);
  const rows = res.data || [];
  return (
    rows.find((b) => b.title.toLowerCase() === String(title).toLowerCase()) ||
    rows[0] ||
    null
  );
}

// ---------------------------------------------------------------- fines

function fineStatus(s) {
  if (s === "PAID") return "Paid";
  if (s === "WAIVED") return "Waived";
  return "Unpaid";
}

export function fineToUi(f) {
  const borrow = f.borrow || {};
  const book = borrow.copy?.book || borrow.book || {};
  return {
    id: f.id,
    member: borrow.user?.name || "—",
    userId: borrow.user?.id,
    reason: book.title ? `Overdue — ${book.title}` : "Library fine",
    amount: money(f.amount),
    status: fineStatus(f.status),
    paidDate: DATE(f.paidAt),
  };
}

export async function listFines() {
  const res = await api("/fines?per_page=100");
  return (res.data || []).map(fineToUi);
}

export async function listMyFines() {
  const res = await api("/fines/me");
  return (res.data || []).map(fineToUi);
}

export async function payFine(fineId) {
  return (await api(`/fines/${fineId}/pay`, { method: "PATCH" })).data;
}

export async function waiveFine(fineId) {
  return (await api(`/fines/${fineId}/waive`, { method: "PATCH" })).data;
}

// ---------------------------------------------------------------- reservations

function reservationStatus(s) {
  switch (s) {
    case "FULFILLED":
      return "Ready for pickup";
    case "COMPLETED":
      return "Completed";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Waiting";
  }
}

function reservationToUi(r, queueIndex = 0) {
  return {
    id: r.id,
    member: r.user?.name || "—",
    userId: r.user?.id || r.userId,
    title: r.book?.title || "—",
    bookId: r.bookId,
    position: queueIndex + 1,
    status: reservationStatus(r.status),
  };
}

// The API returns reservations newest-first; number each book's queue oldest-first.
function withQueuePositions(rows) {
  const positions = {};
  const byBook = {};
  rows.forEach((r) => {
    (byBook[r.bookId] || (byBook[r.bookId] = [])).push(r);
  });
  Object.values(byBook).forEach((list) => {
    list.sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt));
    list.forEach((r, i) => {
      positions[r.id] = i + 1;
    });
  });
  return rows.map((r) => reservationToUi(r, positions[r.id] - 1));
}

export async function listReservations() {
  const res = await api("/reservation?per_page=100");
  return withQueuePositions(res.data || []);
}

export async function listMyReservations() {
  const res = await api("/reservation/me");
  return withQueuePositions(res.data || []);
}

export async function createReservation(bookId) {
  return (await api("/reservation", { method: "POST", body: { bookId } })).data;
}

export async function cancelReservation(id) {
  await api(`/reservation/${id}/cancel`, { method: "PATCH" });
}

// ---------------------------------------------------------------- users

export function userToUi(u) {
  return {
    id: u.studentId || u.id,
    backendId: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "LIBRARIAN" ? "Librarian" : u.role === "ADMIN" ? "Admin" : "Member",
    branch: "—",
    status: u.isActive === false ? "Suspended" : "Active",
    joined: DATE(u.createdAt),
    isActive: u.isActive !== false,
  };
}

export async function listUsers() {
  const res = await api("/users?per_page=100");
  return (res.data || []).map(userToUi);
}

export async function getUserById(id) {
  const res = await api(`/users/${encodeURIComponent(id)}`);
  return res.data ? userToUi(res.data) : null;
}

export async function createUser({ name, email, password, studentId }) {
  return (await api("/users", { method: "POST", body: { name, email, password, studentId } })).data;
}

export async function updateUser(id, patch) {
  return (await api(`/users/${id}`, { method: "PATCH", body: patch })).data;
}

export async function deleteUser(id) {
  await api(`/users/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- categories

export async function listCategories() {
  const res = await api("/categories?per_page=100");
  return (res.data || []).map((c) => ({ id: c.id, name: c.name }));
}

export async function createCategory(name) {
  return (await api("/categories", { method: "POST", body: { name } })).data;
}

export async function updateCategory(id, name) {
  return (await api(`/categories/${id}`, { method: "PATCH", body: { name } })).data;
}

export async function deleteCategory(id) {
  await api(`/categories/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- authors

export async function listAuthors() {
  const res = await api("/authors?per_page=100");
  return (res.data || []).map((a) => ({ id: a.id, name: a.name }));
}

export async function createAuthor(name) {
  return (await api("/authors", { method: "POST", body: { name } })).data;
}

export async function updateAuthor(id, name) {
  return (await api(`/authors/${id}`, { method: "PATCH", body: { name } })).data;
}

export async function deleteAuthor(id) {
  await api(`/authors/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- publishers

export async function listPublishers() {
  const res = await api("/publishers?per_page=100");
  return (res.data || []).map((p) => ({ id: p.id, name: p.name }));
}

export async function createPublisher(name) {
  return (await api("/publishers", { method: "POST", body: { name } })).data;
}

export async function updatePublisher(id, name) {
  return (await api(`/publishers/${id}`, { method: "PATCH", body: { name } })).data;
}

export async function deletePublisher(id) {
  await api(`/publishers/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- book update

export async function updateBook(id, { title, isbn, description, genre, author }) {
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (isbn !== undefined) patch.isbn = isbn;
  if (description !== undefined) patch.description = description;

  if (genre !== undefined) {
    const category = await resolveCategory(genre);
    if (category) patch.categoryId = category.id;
  }
  if (author !== undefined) {
    const authorRec = await resolveAuthor(author);
    if (authorRec) patch.authorIds = [authorRec.id];
  }

  return (await api(`/books/${id}`, { method: "PATCH", body: patch })).data;
}

// ---------------------------------------------------------------- settings

export async function getSettings() {
  const res = await api("/settings");
  return res.data || {};
}

export async function saveSettings(patch) {
  const res = await api("/settings", { method: "PATCH", body: patch });
  return res.data || {};
}

// ---------------------------------------------------------------- copies (inventory)

export async function listAllCopies() {
  const booksRes = await api("/books?per_page=200");
  const books = booksRes.data || [];
  return books.map((b) => {
    const copies = b.copies || [];
    const total = b.totalCopies ?? copies.length;
    const available = b.availableCopies ?? copies.filter((c) => c.status === "AVAILABLE").length;
    const checkedOut = copies.filter((c) => c.status === "CHECKED_OUT").length;
    const lost = copies.filter((c) => c.status === "LOST").length;
    return {
      id: b.id,
      title: b.title,
      isbn: b.isbn,
      totalCopies: total,
      available,
      checkedOut,
      lost,
      lowStock: available <= 1 && total > 0 ? 1 : 0,
    };
  });
}

/** Get a single copy by ID — GET /copies/:id */
export async function getCopyById(id) {
  const res = await api(`/copies/${encodeURIComponent(id)}`);
  return res.data || null;
}

// ---------------------------------------------------------------- audit (borrow activity as audit log)

export async function listAuditLogs() {
  // borrow history is the closest real audit trail on the backend
  const res = await api("/borrow?per_page=200");
  const rows = res.data || [];
  return rows.map((l) => {
    const book = l.copy?.book || {};
    let action = "Checked out";
    if (l.status === "RETURNED") action = "Returned";
    else if (l.status === "OVERDUE") action = "Flagged overdue";
    return {
      time: DATE(l.borrowDate) || "—",
      user: l.user?.name || "—",
      action: `${action}: ${book.title || "unknown title"}`,
      ip: "—",
    };
  });
}

export async function getDashboardStats() {
  const res = await api("/dashboard");
  return res.data || {};
}

export function activityToUi(a) {
  const book = a.copy?.book;
  return {
    who: a.user?.name || "—",
    action: a.status === "RETURNED" ? "returned" : a.status === "OVERDUE" ? "flagged overdue" : "checked out",
    what: book?.title || "an item",
    time: DATE(a.borrowDate) || "",
    type: a.status === "OVERDUE" ? "alert" : "checkout",
  };
}
