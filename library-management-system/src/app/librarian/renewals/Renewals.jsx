"use client";

import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DueStamp from "@/components/ui-lib/DueStamp";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useLoans } from "@/components/ui-lib/LoansContext";

const addDays = (d, n) => new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

export default function Renewals() {
  const { loans, source, renewLoan } = useLoans();
  const showToast = useToast();

  const renew = async (loan) => {
    try {
      await renewLoan(loan.id, loan.member, loan.title);
      showToast("Loan renewed", "brass");
    } catch (err) {
      showToast(err.message || "Could not renew loan", "stamp");
    }
  };

  // "Needs attention": overdue, or due within the next 3 days.
  const needsAttention = (loans || []).filter((l) => {
    if (l.status === "Overdue") return true;
    if (l.status !== "On time") return false;
    const dueDate = new Date(l.due);
    const inThreeDays = addDays(new Date(), 3);
    return l.due <= inThreeDays && dueDate >= new Date(today());
  });

  return (
    <>
      <PageHeader title="Renewals" subtitle="Loans due soon or overdue that may need renewal." />
      {source === "mock" && <DemoBanner />}
      <Card title="Needs Attention">
        <Table
          columns={["Member", "Title", "Due", "Status", ""]}
          rows={needsAttention.map((l) => [
            <span key="m" className="font-medium">{l.member}</span>,
            <span key="t">{l.title}</span>,
            <DueStamp key="d" date={l.due} overdue={l.status === "Overdue"} />,
            <Badge key="s" tone={l.status === "Overdue" ? "stamp" : "sage"}>{l.status}</Badge>,
            <button
              key="btn"
              onClick={() => renew(l)}
              className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
              style={{ background: C.brassSoft, color: "#8A6A2E" }}
            >
              Renew +14 days
            </button>,
          ])}
          emptyMessage="No loans need renewal right now."
        />
      </Card>
    </>
  );
}
