"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useLoans } from "@/components/ui-lib/LoansContext";

const addDays = (d, n) => new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

export default function CheckOutLoan() {
  const { loans, source, checkoutLoan } = useLoans();
  const [form, setForm] = useState({ member: "", title: "", due: addDays(new Date(), 14) });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (f) => {
    const e = {};
    if (!f.member.trim()) e.member = "Member name is required";
    if (!f.title.trim()) e.title = "Title is required";
    return e;
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
      await checkoutLoan({ member: form.member, title: form.title, due: form.due });
      setForm({ member: "", title: "", due: addDays(new Date(), 14) });
      showToast("Checked out", "sage");
    } catch (err) {
      showToast(err.message || "Check-out failed", "stamp");
    } finally {
      setBusy(false);
    }
  };

  const todaysCheckouts = (loans || []).filter((l) => l.checked === today());

  return (
    <>
      <PageHeader title="Check-out" subtitle="Issue a title to a member for a loan." />
      {source === "mock" && <DemoBanner />}
      <Card title="Check Out a Title">
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Member name</label>
            <input value={form.member} onChange={setField("member")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.member ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.member && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.member}</p>}
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Title</label>
            <input value={form.title} onChange={setField("title")} className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${errors.title ? C.stamp : C.paperLine}`, color: C.slate }} />
            {errors.title && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors.title}</p>}
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Due date</label>
              <input value={form.due} onChange={setField("due")} type="date" className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none" style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }} />
            </div>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer disabled:opacity-60" style={{ background: C.sage, color: "#fff", whiteSpace: "nowrap" }}>
              {busy ? "…" : "Check Out"}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Checked Out Today">
        <Table
          columns={["Member", "Title", "Checked Out", "Due", "Status"]}
          rows={todaysCheckouts.map((l) => [
            <span key="m" className="font-medium">{l.member}</span>,
            <span key="t">{l.title}</span>,
            <span key="c" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{l.checked}</span>,
            <span key="d" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{l.due}</span>,
            <Badge key="s" tone={l.status === "Overdue" ? "stamp" : "sage"}>{l.status}</Badge>,
          ])}
          emptyMessage="No checkouts yet today."
        />
      </Card>
    </>
  );
}
