"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Badge from "@/components/ui-lib/Badge";
import Modal from "@/components/ui-lib/Modal";
import { useToast } from "@/components/ui-lib/Toast";
import { branches as initialBranches } from "@/lib/mock-data";

const emptyForm = { name: "", address: "", hours: "", capacity: "", staff: "" };

// No /branches endpoint exists in the backend — changes are local only.
export default function BranchesConfig() {
  const [branches, setBranches] = useState(initialBranches);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const showToast = useToast();

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.address.trim()) e.address = "Address is required";
    const capacity = Number(f.capacity);
    const staff = Number(f.staff);
    if (f.capacity !== "" && (isNaN(capacity) || capacity < 0)) e.capacity = "Capacity must be a number ≥ 0";
    if (f.staff !== "" && (isNaN(staff) || staff < 0)) e.staff = "Staff must be a number ≥ 0";
    return e;
  };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validate(form);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }
    setErrors({});
    const newBranch = {
      ...form,
      capacity: Number(form.capacity) || 0,
      staff: Number(form.staff) || 0,
      status: "Open",
    };
    setBranches((prev) => [...prev, newBranch]);
    setModalOpen(false);
    setForm(emptyForm);
    showToast("Branch added", "sage");
  };

  const toggleStatus = (name) => {
    let next = null;
    setBranches((prev) =>
      prev.map((b) => {
        if (b.name === name) {
          next = b.status === "Open" ? "Renovation" : "Open";
          return { ...b, status: next };
        }
        return b;
      })
    );
    showToast(next === "Open" ? `${name} reopened` : `${name} closed for renovation`, "brass");
  };

  return (
    <>
      <PageHeader
        title="Branch / Library Configuration"
        subtitle="Manage locations, hours, and capacity."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md f-body text-[13px] font-medium"
            style={{ background: C.ink, color: C.paper }}
          >
            <Plus size={14} /> Add Branch
          </button>
        }
      />
      <div
        className="px-4 py-3 rounded-md f-body text-[12.5px] mb-4"
        style={{ background: C.brassSoft, color: "#8A6A2E", border: `1px solid #DEC88A` }}
      >
        No backend API for branches — changes are saved locally and will reset on refresh.
      </div>
      <div className="grid grid-cols-2 gap-4">
        {branches.map((b) => (
          <Card key={b.name}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="f-display text-[17px]" style={{ color: C.ink }}>{b.name}</h3>
                <p className="f-body text-[13px] mt-0.5" style={{ color: C.slateMute }}>{b.address}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge tone={b.status === "Open" ? "sage" : "brass"}>{b.status}</Badge>
                <button
                  onClick={() => toggleStatus(b.name)}
                  className="f-body text-[11.5px] px-2 py-1 rounded cursor-pointer"
                  style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
                >
                  {b.status === "Open" ? "Close for renovation" : "Reopen"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${C.paperLine}` }}>
              <div>
                <span className="f-body text-[11px] uppercase" style={{ color: C.slateMute }}>Hours</span>
                <p className="f-body text-[13px]" style={{ color: C.slate }}>{b.hours}</p>
              </div>
              <div>
                <span className="f-body text-[11px] uppercase" style={{ color: C.slateMute }}>Capacity</span>
                <p className="f-body text-[13px]" style={{ color: C.slate }}>{b.capacity}</p>
              </div>
              <div>
                <span className="f-body text-[11px] uppercase" style={{ color: C.slateMute }}>Staff</span>
                <p className="f-body text-[13px]" style={{ color: C.slate }}>{b.staff}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Branch"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="add-branch-form" className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
              Add Branch
            </button>
          </>
        }
      >
        <form id="add-branch-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Name</label>
            <input value={form.name} onChange={setField("name")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.name ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.name && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.name}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Address</label>
            <input value={form.address} onChange={setField("address")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.address ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.address && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.address}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Hours</label>
            <input value={form.hours} onChange={setField("hours")} placeholder="e.g. 9:00–19:00" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Capacity</label>
              <input value={form.capacity} onChange={setField("capacity")} type="number" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.capacity ? C.stamp : C.paperLine}`, color: C.slate }} />
              {errors.capacity && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.capacity}</p>}
            </div>
            <div>
              <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Staff</label>
              <input value={form.staff} onChange={setField("staff")} type="number" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.staff ? C.stamp : C.paperLine}`, color: C.slate }} />
              {errors.staff && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.staff}</p>}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
