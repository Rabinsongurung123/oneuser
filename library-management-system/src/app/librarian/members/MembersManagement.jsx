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
import { users as allUsers } from "@/lib/mock-data";
import { listUsers, createUser, updateUser, deleteUser } from "@/lib/backend";

const initialMembers = allUsers.filter((u) => u.role === "Member");
const branchOptions = ["Central", "Eastside", "Riverside", "Uptown"];

export default function MembersManagement() {
  const { data: members, source, reload } = useApiData(listUsers, initialMembers);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", studentId: "", password: "member123", branch: "Central" });
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const rows = members || [];

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Enter a valid email";
    if (!f.studentId.trim()) e.studentId = "Member ID is required";
    if (f.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const filteredMembers = rows.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    const matchesBranch = branchFilter === "All" || u.branch === branchFilter;
    return matchesSearch && matchesBranch;
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
      setModalOpen(false);
      setForm({ name: "", email: "", studentId: "", password: "member123", branch: "Central" });
      await reload();
      showToast("Member registered", "sage");
    } catch (err) {
      showToast(err.message || "Could not register member", "stamp");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (member) => {
    try {
      await updateUser(member.backendId, { isActive: !member.isActive });
      await reload();
      showToast(member.isActive ? `${member.name} suspended` : "Member reinstated", "brass");
    } catch (err) {
      showToast(err.message || "Could not update member", "stamp");
    }
  };

  const removeMember = async (member) => {
    try {
      await deleteUser(member.backendId);
      await reload();
      showToast(`${member.name} removed`, "stamp");
    } catch (err) {
      showToast(err.message || "Could not remove member", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Members" subtitle="Registered library members across branches." />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search members by name or ID…"
        buttonLabel="Register Member"
        onButton={() => setModalOpen(true)}
        search={search}
        onSearchChange={setSearch}
        filterOptions={branchOptions}
        filterValue={branchFilter}
        onFilterChange={setBranchFilter}
      />
      <Card>
        <Table
          columns={["ID", "Name", "Email", "Branch", "Status", "Joined", ""]}
          rows={filteredMembers.map((u) => [
            <span key="id" className="f-mono" style={{ color: C.slateMute }}>{u.id}</span>,
            <span key="name" className="font-medium">{u.name}</span>,
            <span key="email">{u.email}</span>,
            <span key="branch">{u.branch}</span>,
            <Badge key="status" tone={u.status === "Active" ? "sage" : "stamp"}>{u.status}</Badge>,
            <span key="joined">{u.joined}</span>,
            <RowMenu
              key="menu"
              items={[
                {
                  label: u.status === "Active" ? "Suspend" : "Activate",
                  onClick: () => toggleStatus(u),
                },
                {
                  label: "Remove",
                  danger: true,
                  onClick: () => setConfirmDelete(u),
                },
              ]}
            />,
          ])}
          emptyMessage="No members match your search."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Member"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="add-member-form" disabled={busy} className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
              {busy ? "Registering…" : "Register"}
            </button>
          </>
        }
      >
        <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4">
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
          removeMember(u);
        }}
        title="Remove member?"
        message={`This will permanently remove ${confirmDelete?.name} from the membership.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}
