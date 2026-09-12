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

export default function MyLoans() {
  const { loans, source, renewLoan } = useLoans();
  const showToast = useToast();

  const myLoans = loans || [];

  const renew = async (loan) => {
    try {
      await renewLoan(loan.id, loan.member, loan.title);
      showToast("Loan renewed", "brass");
    } catch (err) {
      showToast(err.message || "Could not renew loan", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="My Loans" subtitle="Titles you currently have checked out." />
      {source === "mock" && <DemoBanner />}
      <Card>
        <Table
          columns={["Title", "Checked Out", "Due", "Status", ""]}
          rows={myLoans.map((l) => [
            <span key="title" className="font-medium">{l.title}</span>,
            <span key="checked" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{l.checked}</span>,
            <DueStamp key="due" date={l.due} overdue={l.status === "Overdue"} />,
            <Badge key="status" tone={l.status === "Overdue" ? "stamp" : "sage"}>{l.status}</Badge>,
            l.status === "On time" ? (
              <button
                key="renew"
                onClick={() => renew(l)}
                className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
                style={{ background: C.brassSoft, color: "#8A6A2E" }}
              >
                Renew
              </button>
            ) : null,
          ])}
          emptyMessage="You have no loans."
        />
      </Card>
    </>
  );
}
