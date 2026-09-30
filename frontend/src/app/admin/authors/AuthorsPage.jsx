"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import RowMenu from "@/components/ui-lib/RowMenu";
import Modal from "@/components/ui-lib/Modal";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { listAuthors, createAuthor, updateAuthor, deleteAuthor } from "@/lib/backend";
import { C } from "@/components/ui-lib/theme";

export default function AuthorsPage() {
  const { data: authors, source, reload } = useApiData(listAuthors, []);
  const showToast = useToast();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = (authors || []).filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (author) => {
    setEditing(author);
    setName(author.name);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Author name is required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await updateAuthor(editing.id, name.trim());
        showToast("Author updated", "sage");
      } else {
        await createAuthor(name.trim());
        showToast("Author added", "sage");
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setError(err.message || "Could not save author");
    } finally {
      setBusy(false);
    }
  };

  const removeAuthor = async (author) => {
    try {
      await deleteAuthor(author.id);
      await reload();
      showToast(`Deleted "${author.name}"`, "stamp");
    } catch (err) {
      showToast(err.message || "Could not delete author", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Authors" subtitle="The people behind the books in your catalog." />
      {source === "mock" && <DemoBanner />}

      <Toolbar
        placeholder="Search authors…"
        buttonLabel="Add Author"
        onButton={openCreate}
        search={search}
        onSearchChange={setSearch}
      />

      <Card>
        <Table
          columns={["Name", ""]}
          rows={rows.map((a) => [
            <span key="name" className="f-body text-[13.5px] font-medium">{a.name}</span>,
            <RowMenu
              key="menu"
              items={[
                { label: "Edit", onClick: () => openEdit(a) },
                { label: "Delete", danger: true, onClick: () => setConfirmDelete(a) },
              ]}
            />,
          ])}
          emptyMessage={search ? "No authors match your search." : "No authors yet — add the first one."}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Author" : "Add Author"}
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
              form="author-form"
              disabled={busy}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium disabled:opacity-60"
              style={{ background: C.ink, color: C.paper }}
            >
              {busy ? "Saving…" : editing ? "Save Changes" : "Add Author"}
            </button>
          </>
        }
      >
        <form id="author-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>
              Name
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. George Orwell"
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={{ background: C.paper, border: `1px solid ${error ? C.stamp : C.paperLine}`, color: C.slate }}
            />
            {error && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{error}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          const a = confirmDelete;
          setConfirmDelete(null);
          removeAuthor(a);
        }}
        title="Delete author?"
        message={`This will remove "${confirmDelete?.name}" from the system.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
