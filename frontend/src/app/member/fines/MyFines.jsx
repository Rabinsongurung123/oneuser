"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useFines } from "@/components/ui-lib/FinesContext";

export default function MyFines() {
  const { fines, source, payFine } = useFines();
  const [confirmPay, setConfirmPay] = useState(null);
  const showToast = useToast();

  const myUnpaid = (fines || []).filter((f) => f.status === "Unpaid");
  const total = myUnpaid.reduce((s, f) => s + f.amount, 0);

  const pay = async (fine) => {
    try {
      await payFine(fine);
      showToast("Payment received", "sage");
    } catch (err) {
      showToast(err.message || "Payment failed", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="My Fines" subtitle={`$${total.toFixed(2)} outstanding.`} />
      {source === "mock" && <DemoBanner />}
      <Card>
        <Table
          columns={["Reason", "Amount", "Status", ""]}
          rows={myUnpaid.map((f) => [
            <span key="reason">{f.reason}</span>,
            <span key="amount" className="f-mono">${f.amount.toFixed(2)}</span>,
            <Badge key="status" tone="stamp">{f.status}</Badge>,
            <button
              key="pay"
              onClick={() => setConfirmPay(f)}
              className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
              style={{ background: C.sage, color: "#fff" }}
            >
              Pay
            </button>,
          ])}
          emptyMessage="You have no outstanding fines."
        />
      </Card>

      <ConfirmDialog
        open={!!confirmPay}
        onClose={() => setConfirmPay(null)}
        onConfirm={() => {
          const f = confirmPay;
          setConfirmPay(null);
          pay(f);
        }}
        title="Confirm payment"
        message={`Pay $${confirmPay ? confirmPay.amount.toFixed(2) : "0.00"} now?`}
        confirmLabel="Pay Now"
      />
    </>
  );
}
