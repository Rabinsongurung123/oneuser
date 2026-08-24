"use client";

import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useFines } from "@/components/ui-lib/FinesContext";

export default function Payments() {
  const { fines, source } = useFines();
  // Read-only payment history: paid fines belonging to the current member.
  const paidEntries = (fines || []).filter((f) => f.status === "Paid" || f.status === "Waived");

  return (
    <>
      <PageHeader title="Payments" subtitle="Your payment history." />
      {source === "mock" && <DemoBanner />}
      <Card>
        <Table
          columns={["Reason", "Amount", "Date Paid", "Status"]}
          rows={paidEntries.map((f) => [
            <span key="reason">{f.reason}</span>,
            <span key="amount" className="f-mono">${f.amount.toFixed(2)}</span>,
            <span key="date" className="f-mono text-[12px]" style={{ color: C.slateMute }}>
              {f.paidDate || "—"}
            </span>,
            <Badge key="status" tone={f.status === "Paid" ? "sage" : "brass"}>{f.status}</Badge>,
          ])}
          emptyMessage="No payment history yet."
        />
      </Card>
    </>
  );
}
