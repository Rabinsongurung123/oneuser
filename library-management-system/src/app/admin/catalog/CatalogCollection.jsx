"use client";

import { useState, useCallback } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import RowMenu from "@/components/ui-lib/RowMenu";
import Modal from "@/components/ui-lib/Modal";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { catalog as mockCatalog } from "@/lib/mock-data";
import { listBooks, searchBooks, listBooksByCategory, createBook, updateBook, deleteBook } from "@/lib/backend";

const genreOptions = ["Fiction", "Sci-Fi", "Non-fiction", "Children's", "Reference"];
const emptyForm = { call: "", title: "", author: "", genre: "Fiction", copies: "1", available: "1" };

export default function CatalogCollection() {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  const loader = useCallback(() => {
    if (search.trim()) return searchBooks(search);
    if (genreFilter) return listBooksByCategory(genreFilter);
    return listBooks();
  }, [search, genreFilter]);

  const { data: catalog, source, reload } = useApiData(loader, mockCatalog, [search, genreFilter]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = add mode, object = edit mode
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const rows = catalog || [];
  const validate = (f) => {
    const e = {};
    if (!f.call.trim()) e.call = "ISBN / call number is required";
    if (!f.title.trim()) e.title = "Title is required";
    if (!f.author.trim()) e.author = "Author is required";
    const copies = Number(f.copies);
    const available = Number(f.available);
    if (isNaN(copies) || copies < 0) e.copies = "Copies must be a number ≥ 0";
    if (isNaN(available) || available < 0) e.available = "Available must be a number ≥ 0";
    else if (available > copies) e.available = "Available cannot exceed copies";
    return e;
  };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      call: item.call || "",
      title: item.title || "",
      author: item.author || "",
      genre: item.genre || "Fiction",
      copies: String(item.copies ?? "1"),
      available: String(item.available ?? "1"),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const foundErrors = validate(form);
    if (Object.keys(foundErrors).length > 0) { setErrors(foundErrors); return; }
    setErrors({});
    setBusy(true);
    try {
      if (editItem) {
        await updateBook(editItem.id, {
          title: form.title,
          isbn: form.call,
          genre: form.genre,
          author: form.author,
          description: editItem.desc || "",
        });
        showToast("Title updated", "sage");
      } else {
        await createBook({
          title: form.title,
          isbn: form.call,
          description: "",
          genre: form.genre,
          author: form.author,
          copies: Number(form.copies) || 0,
          available: Number(form.available) || 0,
        });
        showToast("Title added", "sage");
      }
      setModalOpen(false);
      setForm(emptyForm);
      await reload();
    } catch (err) {
      showToast(err.message || "Could not save title", "stamp");
    } finally {
      setBusy(false);
    }
  };

  const removeTitle = async (item) => {
    try {
      await deleteBook(item.id);
      await reload();
      showToast(`${item.title} removed`, "stamp");
    } catch (err) {
      showToast(err.message || "Could not remove title", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Catalog" subtitle="Browse and manage the collection." />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by title, author, or call number…"
        buttonLabel="Add Title"
        onButton={openAdd}
        search={search}
        onSearchChange={setSearch}
        filterOptions={genreOptions}
        filterValue={genreFilter}
        onFilterChange={setGenreFilter}
      />
      <Card>
        <Table
          columns={["Call No.", "Title", "Author", "Genre", "Copies", "Available", ""]}
          rows={rows.map((c) => [
            <span key="call" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{c.call}</span>,
            <span key="title" className="font-medium">{c.title}</span>,
            <span key="author">{c.author}</span>,
            <Badge key="genre" tone="brass">{c.genre}</Badge>,
            <span key="copies">{c.copies}</span>,
            <Badge key="avail" tone={c.available > 0 ? "sage" : "stamp"}>{c.available > 0 ? `${c.available} available` : "All checked out"}</Badge>,
            <RowMenu
              key="menu"
              items={[
                { label: "Edit title", onClick: () => openEdit(c) },
                { label: "Remove title", danger: true, onClick: () => setConfirmRemove(c) },
              ]}
            />,
          ])}
          emptyMessage="No titles match your search."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Title" : "Add Title"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="add-title-form" disabled={busy} className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
              {busy ? "Saving…" : editItem ? "Save Changes" : "Add Title"}
            </button>
          </>
        }
      >
        <form id="add-title-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>ISBN / Call number</label>
            <input value={form.call} onChange={setField("call")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.call ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.call && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.call}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Title</label>
            <input value={form.title} onChange={setField("title")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.title ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.title && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.title}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Author</label>
            <input value={form.author} onChange={setField("author")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.author ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.author && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.author}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Genre</label>
            <select value={form.genre} onChange={setField("genre")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer" style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}>
              {genreOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          {!editItem && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Copies</label>
              <input value={form.copies} onChange={setField("copies")} type="number" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.copies ? C.stamp : C.paperLine}`, color: C.slate }} />
              {errors.copies && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.copies}</p>}
            </div>
            <div>
              <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Available</label>
              <input value={form.available} onChange={setField("available")} type="number" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.available ? C.stamp : C.paperLine}`, color: C.slate }} />
              {errors.available && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.available}</p>}
            </div>
          </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => {
          const item = confirmRemove;
          setConfirmRemove(null);
          removeTitle(item);
        }}
        title="Remove title?"
        message={`This will permanently remove "${confirmRemove?.title}" from the catalog.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
