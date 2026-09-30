"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import RowMenu from "@/components/ui-lib/RowMenu";
import Modal from "@/components/ui-lib/Modal";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import {
  listBooks,
  listCopiesForBook,
  createCopy,
  updateCopy,
  deleteCopy,
} from "@/lib/backend";
import { C } from "@/components/ui-lib/theme";

const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];
const STATUSES = ["AVAILABLE", "CHECKED_OUT", "RESERVED", "IN_TRANSIT", "WITHDRAWN"];

const STATUS_TONE = {
  AVAILABLE: "sage",
  CHECKED_OUT: "brass",
  RESERVED: "slate",
  IN_TRANSIT: "slate",
  WITHDRAWN: "stamp",
};

const inputStyle = (error) => ({
  background: C.paper,
  border: `1px solid ${error ? C.stamp : C.paperLine}`,
  color: C.slate,
});

function Field({ label, error, children }) {
  return (
    <div>
      <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>
        {label}
      </label>
      {children}
      {error && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{error}</p>}
    </div>
  );
}

export default function CopiesPage() {
  const showToast = useToast();

  // book picker
  const { data: books } = useApiData(listBooks, []);
  const [selectedId, setSelectedId] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  // copies for the selected book
  const { data: copies, source, reload } = useApiData(
    async () => (selectedId ? listCopiesForBook(selectedId) : []),
    [],
    [selectedId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ barcode: "", condition: "GOOD", shelfLocation: "", status: "AVAILABLE" });
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const selectedBook = (books || []).find((b) => b.id === selectedId);

  const filteredBooks = (books || []).filter(
    (b) => !bookSearch || b.title.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ barcode: "", condition: "GOOD", shelfLocation: "", status: "AVAILABLE" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (copy) => {
    setEditing(copy);
    setForm({
      barcode: copy.barcode || "",
      condition: copy.condition || "GOOD",
      shelfLocation: copy.shelfLocation === "—" ? "" : copy.shelfLocation || "",
      status: copy.status || "AVAILABLE",
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.barcode.trim()) found.barcode = "Barcode is required";
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        // barcode is immutable on PATCH /copies/:id — only condition/shelf/status
        await updateCopy(editing.id, {
          condition: form.condition,
          shelfLocation: form.shelfLocation.trim() || undefined,
          status: form.status,
        });
        showToast("Copy updated", "sage");
      } else {
        await createCopy({
          bookId: selectedId,
          barcode: form.barcode.trim(),
          condition: form.condition,
          shelfLocation: form.shelfLocation.trim() || undefined,
        });
        showToast("Copy added", "sage");
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setErrors({ form: err.message || "Could not save copy" });
    } finally {
      setBusy(false);
    }
  };

  const removeCopy = async (copy) => {
    try {
      await deleteCopy(copy.id);
      await reload();
      showToast(`Copy ${copy.barcode} deleted`, "stamp");
    } catch (err) {
      showToast(err.message || "Could not delete copy", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Copies" subtitle="Physical copies per title — barcode, condition, shelf, and status." />
      {source === "mock" && <DemoBanner />}

      {/* Book picker */}
      <Card title="Choose a book" className="mb-4">
        <input
          value={bookSearch}
          onChange={(e) => setBookSearch(e.target.value)}
          placeholder="Filter titles…"
          className="w-full max-w-sm px-3 py-2 rounded-md f-body text-[13px] outline-none mb-3"
          style={inputStyle(false)}
        />
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredBooks.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className="px-3 py-1.5 rounded-md f-body text-[12.5px] cursor-pointer transition-opacity hover:opacity-80"
              style={
                selectedId === b.id
                  ? { background: C.ink, color: C.paper }
                  : { background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }
              }
            >
              {b.title}
            </button>
          ))}
          {filteredBooks.length === 0 && (
            <p className="f-body text-[13px]" style={{ color: C.slateMute }}>
              No books found — add titles in the Catalog first.
            </p>
          )}
        </div>
      </Card>

      {selectedId && (
        <Card
          title={`Copies — ${selectedBook?.title || ""}`}
          action={
            <button
              onClick={openCreate}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
              style={{ background: C.ink, color: C.paper }}
            >
              + Add Copy
            </button>
          }
        >
          <Table
            columns={["Barcode", "Condition", "Shelf", "Status", ""]}
            rows={(copies || []).map((c) => [
              <span key="bc" className="f-mono" style={{ color: C.slateMute }}>{c.barcode}</span>,
              <span key="cond">{c.condition}</span>,
              <span key="shelf">{c.shelfLocation}</span>,
              <Badge key="status" tone={STATUS_TONE[c.status] || "slate"}>{c.status}</Badge>,
              <RowMenu
                key="menu"
                items={[
                  { label: "Edit", onClick: () => openEdit(c) },
                  { label: "Delete", danger: true, onClick: () => setConfirmDelete(c) },
                ]}
              />,
            ])}
            emptyMessage="No copies for this book yet — add the first one."
          />
        </Card>
      )}

      {!selectedId && books && books.length > 0 && (
        <Card>
          <p className="f-body text-[13px]" style={{ color: C.slateMute }}>
            Select a book above to view and manage its copies.
          </p>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Copy" : "Add Copy"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="copy-form"
              disabled={busy}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium disabled:opacity-60"
              style={{ background: C.ink, color: C.paper }}
            >
              {busy ? "Saving…" : editing ? "Save Changes" : "Add Copy"}
            </button>
          </>
        }
      >
        <form id="copy-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Barcode" error={errors.barcode}>
            <input
              value={form.barcode}
              onChange={setField("barcode")}
              disabled={!!editing}
              placeholder="e.g. BC-0001234"
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none disabled:opacity-60"
              style={inputStyle(errors.barcode)}
            />
          </Field>
          <Field label="Condition">
            <select value={form.condition} onChange={setField("condition")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer" style={inputStyle(false)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Shelf location">
            <input
              value={form.shelfLocation}
              onChange={setField("shelfLocation")}
              placeholder="e.g. A-12-3"
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={inputStyle(false)}
            />
          </Field>
          {editing && (
            <Field label="Status">
              <select value={form.status} onChange={setField("status")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer" style={inputStyle(false)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}
          {errors.form && (
            <p className="f-body text-[12.5px] px-3 py-2 rounded-md" style={{ background: C.stampSoft, color: C.stamp }}>
              {errors.form}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          const c = confirmDelete;
          setConfirmDelete(null);
          removeCopy(c);
        }}
        title="Delete copy?"
        message={`This will permanently remove copy ${confirmDelete?.barcode}.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
