"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DueStamp from "@/components/ui-lib/DueStamp";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useLoans } from "@/components/ui-lib/LoansContext";

const statusOptions = ["All", "On time", "Overdue"];

export default function CheckInReturns() {
  const { loans, source, returnLoan } = useLoans();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const showToast = useToast();

  const checkin = async (loan) => {
    try {
      await returnLoan(loan.id, loan.member, loan.title);
      showToast("Returned", "sage");
    } catch (err) {
      showToast(err.message || "Check-in failed", "stamp");
    }
  };

  const filtered = (loans || []).filter((l) => {
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
      <PageHeader title="Check-in / Returns" subtitle="Process returns for active loans." />
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
            <button
              key="btn"
              onClick={() => checkin(l)}
              className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
              style={{ background: C.ink, color: C.paper }}
            >
              Check In
            </button>,
          ])}
          emptyMessage="No active loans."
        />
      </Card>
    </>
  );
}
