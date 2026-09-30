"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import StatCard from "@/components/ui-lib/StatCard";
import { C } from "@/components/ui-lib/theme";
import { useApiData } from "@/components/ui-lib/useApiData";
import { BookOpen, RefreshCw, AlertTriangle, CircleDollarSign } from "lucide-react";
import { getDashboardStats, listLoans, listFines, listAllCopies } from "@/lib/backend";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

// CSV helpers — download real data from the live endpoints
function downloadCsv(name, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = String(r[h] ?? "");
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadAll() {
  const [stats, loans, fines, inventory] = await Promise.all([
    getDashboardStats(),
    listLoans(),
    listFines(),
    listAllCopies(),
  ]);
  return { stats, loans, fines, inventory };
}

export default function ReportGenerator() {
  const { data } = useApiData(loadAll, { stats: {}, loans: [], fines: [], inventory: [] });
  const [busy, setBusy] = useState(null);

  const stats = data?.stats || {};
  const loans = data?.loans || [];
  const fines = data?.fines || [];
  const inventory = data?.inventory || [];

  const overdue = loans.filter((l) => l.status === "Overdue");
  const unpaid = fines.filter((f) => f.status === "Unpaid");
  const outstanding = unpaid.reduce((s, f) => s + f.amount, 0);
  const collected = fines.filter((f) => f.status === "Paid").reduce((s, f) => s + f.amount, 0);

  const reports = [
    {
      key: "circulation",
      name: "Circulation Report",
      desc: `${loans.length} loan records — every borrow/return in the system.`,
      rows: loans.map((l) => ({
        member: l.member,
        title: l.title,
        checkedOut: l.checked,
        due: l.due,
        status: l.status,
      })),
    },
    {
      key: "overdue",
      name: "Overdue Report",
      desc: `${overdue.length} overdue loans past their due date.`,
      rows: overdue.map((l) => ({
        member: l.member,
        title: l.title,
        due: l.due,
        status: l.status,
      })),
    },
    {
      key: "fines",
      name: "Fines Report",
      desc: `${fines.length} fines — ${money(outstanding)} outstanding, ${money(collected)} collected.`,
      rows: fines.map((f) => ({
        member: f.member,
        reason: f.reason,
        amount: f.amount,
        status: f.status,
        paidDate: f.paidDate,
      })),
    },
    {
      key: "inventory",
      name: "Inventory Report",
      desc: `${inventory.length} titles with per-title copy counts.`,
      rows: inventory.map((b) => ({
        title: b.title,
        isbn: b.isbn,
        totalCopies: b.totalCopies,
        available: b.available,
        checkedOut: b.checkedOut,
        lost: b.lost,
      })),
    },
  ];

  const generate = (r) => {
    if (!r.rows.length) return;
    setBusy(r.key);
    // small delay so the disabled state is visible
    setTimeout(() => {
      downloadCsv(r.key, r.rows);
      setBusy(null);
    }, 300);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Live operational reports, exported as CSV from real system data." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Catalog Items" value={(stats.totalBooks ?? 0).toLocaleString()} icon={BookOpen} />
        <StatCard label="Active Loans" value={(stats.borrowedBooks ?? 0).toLocaleString()} icon={RefreshCw} />
        <StatCard label="Overdue Items" value={(stats.overdueBooks ?? 0).toLocaleString()} icon={AlertTriangle} />
        <StatCard label="Outstanding Fines" value={money(outstanding)} icon={CircleDollarSign} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.key}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="f-display text-[16px]" style={{ color: C.ink }}>{r.name}</h3>
                <p className="f-body text-[13px] mt-1" style={{ color: C.slateMute }}>{r.desc}</p>
              </div>
              <FileDown size={18} style={{ color: C.brass, flexShrink: 0 }} />
            </div>
            <button
              onClick={() => generate(r)}
              disabled={busy === r.key || !r.rows.length}
              className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-md f-body text-[12.5px] cursor-pointer disabled:cursor-default"
              style={{
                background: busy === r.key ? C.paperLine : C.paper,
                border: `1px solid ${C.paperLine}`,
                color: busy === r.key || !r.rows.length ? C.slateMute : C.slate,
              }}
            >
              <FileDown size={13} />
              {busy === r.key ? "Exporting…" : r.rows.length ? "Export CSV" : "No data"}
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
