"use client";

import { useState } from "react";
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
import { users as initialUsers } from "@/lib/mock-data";
import { listUsers, createUser, updateUser, deleteUser, getUserById } from "@/lib/backend";

const roleOptions = ["All", "Admin", "Librarian", "Member"];

export default function UsersManagement() {
  const { data: users, source, reload } = useApiData(listUsers, initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Member", studentId: "", password: "member123" });
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const showToast = useToast();

  const rows = users || [];

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Enter a valid email";
    if (!f.studentId.trim()) e.studentId = "Member ID is required";
    if (f.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const filteredUsers = rows.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const foundErrors = validate(form);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        studentId: form.studentId,
      });
      if (form.role !== "Member") {
        showToast("New accounts are registered as members — staff roles are provisioned separately", "brass");
      } else {
        showToast("User added", "sage");
      }
      setModalOpen(false);
      setForm({ name: "", email: "", role: "Member", studentId: "", password: "member123" });
      await reload();
    } catch (err) {
      showToast(err.message || "Could not add user", "stamp");
    } finally {
      setBusy(false);
    }
  };

  const viewDetails = async (user) => {
    try {
      const full = await getUserById(user.backendId);
      setViewUser(full || user);
    } catch {
      setViewUser(user);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await updateUser(user.backendId, { isActive: !user.isActive });
      await reload();
      showToast(user.isActive ? `${user.name} suspended` : "User reinstated", "brass");
    } catch (err) {
      showToast(err.message || "Could not update user", "stamp");
    }
  };

  const removeUser = async (user) => {
    try {
      await deleteUser(user.backendId);
      await reload();
      showToast(`${user.name} deleted`, "stamp");
    } catch (err) {
      showToast(err.message || "Could not delete user", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="User Management" subtitle="Members, librarians, and admins across all branches." />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search users by name or ID…"
        buttonLabel="Add User"
        onButton={() => setModalOpen(true)}
        search={search}
        onSearchChange={setSearch}
        filterOptions={roleOptions}
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
      />
      <Card>
        <Table
          columns={["ID", "Name", "Email", "Role", "Branch", "Status", "Joined", ""]}
          rows={filteredUsers.map((u) => [
            <span key="id" className="f-mono" style={{ color: C.slateMute }}>{u.id}</span>,
            <span key="name" className="font-medium">{u.name}</span>,
            <span key="email">{u.email}</span>,
            <Badge key="role" tone={u.role === "Admin" ? "stamp" : u.role === "Librarian" ? "brass" : "slate"}>{u.role}</Badge>,
            <span key="branch">{u.branch}</span>,
            <Badge key="status" tone={u.status === "Active" ? "sage" : "stamp"}>{u.status}</Badge>,
            <span key="joined">{u.joined}</span>,
            <RowMenu
              key="menu"
              items={[
                {
                  label: "View details",
                  onClick: () => viewDetails(u),
                },
                {
                  label: u.status === "Active" ? "Suspend" : "Activate",
                  onClick: () => toggleStatus(u),
                },
                {
                  label: "Delete",
                  danger: true,
                  onClick: () => setConfirmDelete(u),
                },
              ]}
            />,
          ])}
          emptyMessage="No users match your search."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add User"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="add-user-form" disabled={busy} className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
              {busy ? "Adding…" : "Add User"}
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Full name</label>
            <input
              value={form.name}
              onChange={setField("name")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={{ background: C.paper, border: `1px solid ${errors.name ? C.stamp : C.paperLine}`, color: C.slate }}
            />
            {errors.name && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.name}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Email</label>
            <input
              value={form.email}
              onChange={setField("email")}
              type="email"
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={{ background: C.paper, border: `1px solid ${errors.email ? C.stamp : C.paperLine}`, color: C.slate }}
            />
            {errors.email && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.email}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Role</label>
            <select
              value={form.role}
              onChange={setField("role")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              {roleOptions.filter((r) => r !== "All").map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Member ID</label>
            <input
              value={form.studentId}
              onChange={setField("studentId")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={{ background: C.paper, border: `1px solid ${errors.studentId ? C.stamp : C.paperLine}`, color: C.slate }}
            />
            {errors.studentId && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.studentId}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Initial password</label>
            <input
              value={form.password}
              onChange={setField("password")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={{ background: C.paper, border: `1px solid ${errors.password ? C.stamp : C.paperLine}`, color: C.slate }}
            />
            {errors.password && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.password}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          const u = confirmDelete;
          setConfirmDelete(null);
          removeUser(u);
        }}
        title="Delete user?"
        message={`This will permanently remove ${confirmDelete?.name} from the system.`}
        confirmLabel="Delete"
        danger
      />

      {/* User detail modal — powered by GET /users/:id */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Details"
        footer={
          <button
            onClick={() => setViewUser(null)}
            className="px-3.5 py-2 rounded-md f-body text-[13px]"
            style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
          >
            Close
          </button>
        }
      >
        {viewUser && (
          <div className="space-y-3">
            {[
              ["Name", viewUser.name],
              ["Email", viewUser.email],
              ["Role", viewUser.role],
              ["Member ID", viewUser.id],
              ["Status", viewUser.status],
              ["Joined", viewUser.joined],
              ["Branch", viewUser.branch],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${C.paperLine}` }}>
                <span className="f-body text-[12.5px]" style={{ color: C.slateMute }}>{label}</span>
                <span className="f-body text-[13px] font-medium" style={{ color: C.slate }}>{val || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
