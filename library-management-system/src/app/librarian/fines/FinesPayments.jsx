"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { fines as mockFines } from "@/lib/mock-data";
import { listFines, waiveFine } from "@/lib/backend";

const statusOptions = ["All", "Unpaid", "Paid", "Waived"];

export default function FinesPayments() {
  const { data: fines, source, reload } = useApiData(listFines, mockFines);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const showToast = useToast();

  const rows = fines || [];

  const waive = async (fine) => {
    try {
      await waiveFine(fine.id);
      await reload();
      showToast("Fine waived", "sage");
    } catch (err) {
      showToast(err.message || "Could not waive fine", "stamp");
    }
  };

  const filtered = rows.filter((f) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || f.member.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = rows.filter((f) => f.status === "Unpaid").reduce((s, f) => s + f.amount, 0);

  return (
    <>
      <PageHeader title="Fines" subtitle={`$${total.toFixed(2)} currently outstanding.`} />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by member name…"
        search={search}
        onSearchChange={setSearch}
        filterOptions={statusOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <Card>
        <Table
          columns={["Member", "Reason", "Amount", "Status", ""]}
          rows={filtered.map((f) => [
            <span key="m" className="font-medium">{f.member}</span>,
            <span key="r">{f.reason}</span>,
            <span key="a" className="f-mono">${f.amount.toFixed(2)}</span>,
            <Badge key="s" tone={f.status === "Paid" ? "sage" : f.status === "Waived" ? "brass" : "stamp"}>{f.status}</Badge>,
            f.status === "Unpaid" && (
              <button
                key="btn"
                onClick={() => waive(f)}
                className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
                style={{ background: C.brassSoft, color: "#8A6A2E" }}
              >
                Waive
              </button>
            ),
          ])}
          emptyMessage="No fines match your search."
        />
      </Card>
    </>
  );
}
