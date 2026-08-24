"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DueStamp from "@/components/ui-lib/DueStamp";
import Modal from "@/components/ui-lib/Modal";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useLoans } from "@/components/ui-lib/LoansContext";

const addDays = (d, n) => new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
const statusOptions = ["All", "On time", "Overdue"];

export default function CirculationLoans() {
  const { loans, source, checkoutLoan, returnLoan, renewLoan } = useLoans();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ member: "", title: "", due: addDays(new Date(), 14) });
  const [checkinLoan, setCheckinLoan] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const rows = loans || [];

  const setField = (field) => (e) => {
    setCheckoutForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (f) => {
    const e = {};
    if (!f.member.trim()) e.member = "Member name is required";
    if (!f.title.trim()) e.title = "Title is required";
    return e;
  };

  const openCheckout = () => {
    setCheckoutForm({ member: "", title: "", due: addDays(new Date(), 14) });
    setErrors({});
    setCheckoutOpen(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const foundErrors = validate(checkoutForm);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await checkoutLoan({ member: checkoutForm.member, title: checkoutForm.title, due: checkoutForm.due });
      setCheckoutOpen(false);
      setCheckoutForm({ member: "", title: "", due: addDays(new Date(), 14) });
      showToast("Loan checked out", "sage");
    } catch (err) {
      showToast(err.message || "Check-out failed", "stamp");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!checkinLoan) return;
    const loan =
      rows.find((l) => l.id === checkinLoan) ||
      rows.find((l) => l.title === checkinLoan) ||
      rows.find((l) => `${l.member} — ${l.title}` === checkinLoan);
    if (!loan) return;
    try {
      await returnLoan(loan.id, loan.member, loan.title);
      setCheckinOpen(false);
      setCheckinLoan("");
      showToast("Returned", "sage");
    } catch (err) {
      showToast(err.message || "Check-in failed", "stamp");
    }
  };

  const renew = async (loan) => {
    try {
      await renewLoan(loan.id, loan.member, loan.title);
      showToast("Loan renewed (+14 days)", "brass");
    } catch (err) {
      showToast(err.message || "Could not renew loan", "stamp");
    }
  };

  const filtered = rows.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.member.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Circulation"
        subtitle="Active loans across the system."
        action={
          <div className="flex gap-2">
            <button
              onClick={openCheckout}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
              style={{ background: C.sage, color: "#fff" }}
            >
              Check Out
            </button>
            <button
              onClick={() => setCheckinOpen(true)}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
              style={{ background: C.ink, color: C.paper }}
            >
              Check In
            </button>
          </div>
        }
      />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by member or title…"
        search={search}
        onSearchChange={setSearch}
        filterOptions={statusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <Card>
        <Table
          columns={["Member", "Title", "Checked Out", "Due", "Status", ""]}
          rows={filtered.map((l) => [
            <span key="m" className="font-medium">{l.member}</span>,
            <span key="t">{l.title}</span>,
            <span key="c" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{l.checked}</span>,
            <DueStamp key="d" date={l.due} overdue={l.status === "Overdue"} />,
            <Badge key="s" tone={l.status === "Overdue" ? "stamp" : "sage"}>{l.status}</Badge>,
            l.status === "On time" ? (
              <button
                key="btn"
                onClick={() => renew(l)}
                className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
                style={{ background: C.brassSoft, color: "#8A6A2E" }}
              >
                Renew
              </button>
            ) : null,
          ])}
          emptyMessage="No active loans."
        />
      </Card>

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Check Out"
        footer={
          <>
            <button
              onClick={() => setCheckoutOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="checkout-form" disabled={busy} className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.sage, color: "#fff" }}>
              {busy ? "…" : "Check Out"}
            </button>
          </>
        }
      >
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Member name</label>
            <input value={checkoutForm.member} onChange={setField("member")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.member ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.member && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.member}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Title</label>
            <input value={checkoutForm.title} onChange={setField("title")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.title ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.title && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.title}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Due date</label>
            <input value={checkoutForm.due} onChange={setField("due")} type="date" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }} />
          </div>
        </form>
      </Modal>

      <Modal
        open={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        title="Check In"
        footer={
          <>
            <button
              onClick={() => setCheckinOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button type="submit" form="checkin-form" className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
              Check In
            </button>
          </>
        }
      >
        <form id="checkin-form" onSubmit={handleCheckin} className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Select loan to return</label>
            <select
              value={checkinLoan}
              onChange={(e) => setCheckinLoan(e.target.value)}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              <option value="">Select a loan…</option>
              {rows.map((l) => (
                <option key={l.id || `${l.member}-${l.title}`} value={l.id || `${l.member} — ${l.title}`}>
                  {l.member} — {l.title}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </>
  );
}
