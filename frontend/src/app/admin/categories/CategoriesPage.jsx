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
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/lib/backend";
import { C } from "@/components/ui-lib/theme";

export default function CategoriesPage() {
  const { data: categories, source, reload } = useApiData(listCategories, []);
  const showToast = useToast();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited, or null for create
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = (categories || []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await updateCategory(editing.id, name.trim());
        showToast("Category updated", "sage");
      } else {
        await createCategory(name.trim());
        showToast("Category added", "sage");
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setError(err.message || "Could not save category");
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = async (cat) => {
    try {
      await deleteCategory(cat.id);
      await reload();
      showToast(`Deleted "${cat.name}"`, "stamp");
    } catch (err) {
      // backend rejects deletes while books still reference the category
      showToast(err.message || "Could not delete category", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Group the catalog into genres and subjects." />
      {source === "mock" && <DemoBanner />}

      <Toolbar
        placeholder="Search categories…"
        buttonLabel="Add Category"
        onButton={openCreate}
        search={search}
        onSearchChange={setSearch}
      />

      <Card>
        <Table
          columns={["Name", ""]}
          rows={rows.map((c) => [
            <span key="name" className="f-body text-[13.5px] font-medium">{c.name}</span>,
            <RowMenu
              key="menu"
              items={[
                { label: "Edit", onClick: () => openEdit(c) },
                { label: "Delete", danger: true, onClick: () => setConfirmDelete(c) },
              ]}
            />,
          ])}
          emptyMessage={search ? "No categories match your search." : "No categories yet — add the first one."}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
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
              form="category-form"
              disabled={busy}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium disabled:opacity-60"
              style={{ background: C.ink, color: C.paper }}
            >
              {busy ? "Saving…" : editing ? "Save Changes" : "Add Category"}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="e.g. Programming"
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
          const c = confirmDelete;
          setConfirmDelete(null);
          removeCategory(c);
        }}
        title="Delete category?"
        message={`This will remove "${confirmDelete?.name}". Categories still referenced by books cannot be deleted.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
