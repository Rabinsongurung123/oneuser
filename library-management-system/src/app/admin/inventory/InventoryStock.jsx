"use client";

import { useState } from "react";
import { Boxes, RefreshCw, AlertTriangle } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import StatCard from "@/components/ui-lib/StatCard";
import Toolbar from "@/components/ui-lib/Toolbar";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { inventory as mockInventory } from "@/lib/mock-data";
import { listAllCopies } from "@/lib/backend";

// Transform per-book copy data into UI rows
function toInventoryRows(copies) {
  return copies.map((c) => ({
    id: c.id,
    branch: c.title,         // no branch model — show title as the unit
    isbn: c.isbn || "—",
    totalCopies: c.totalCopies,
    checkedOut: c.checkedOut,
    lost: c.lost,
    lowStock: c.lowStock,
  }));
}

export default function InventoryStock() {
  const { data: rawCopies, source, reload } = useApiData(listAllCopies, null);
  const [search, setSearch] = useState("");
  const showToast = useToast();

  // When API is live use per-book rows; fall back to mock branch-grouped data
  const inventory = source === "api" && rawCopies
    ? toInventoryRows(rawCopies)
    : (mockInventory || []);

  const filtered = inventory.filter((i) => {
    const q = search.toLowerCase();
    return !q || (i.branch || "").toLowerCase().includes(q) || (i.isbn || "").toLowerCase().includes(q);
  });

  const totalCopies = inventory.reduce((s, i) => s + (i.totalCopies || 0), 0);
  const checkedOut  = inventory.reduce((s, i) => s + (i.checkedOut  || 0), 0);
  const lost        = inventory.reduce((s, i) => s + (i.lost        || 0), 0);
  const lowStock    = inventory.reduce((s, i) => s + (i.lowStock    || 0), 0);

  return (
    <>
      <PageHeader title="Inventory" subtitle={source === "api" ? "Live copy counts per title." : "Stock levels and shrinkage by branch."} />
      {source === "mock" && <DemoBanner />}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Copies"      value={totalCopies.toLocaleString()} icon={Boxes} />
        <StatCard label="Checked Out"       value={checkedOut.toLocaleString()}  icon={RefreshCw} />
        <StatCard label="Reported Lost"     value={lost}                          icon={AlertTriangle} />
        <StatCard label="Low Stock Titles"  value={lowStock}                      icon={AlertTriangle} />
      </div>
      <Toolbar
        placeholder={source === "api" ? "Search by title or ISBN…" : "Search by branch…"}
        search={search}
        onSearchChange={setSearch}
      />
      <Card title={source === "api" ? "Copies by Title" : "By Branch"}>
        <Table
          columns={
            source === "api"
              ? ["Title", "ISBN", "Total Copies", "Checked Out", "Lost", "Low Stock", ""]
              : ["Branch", "Total Copies", "Checked Out", "Lost", "Low Stock Titles", ""]
          }
          rows={filtered.map((i, idx) => [
            <span key={`n-${idx}`} className="font-medium">{i.branch}</span>,
            source === "api" && <span key={`isbn-${idx}`} className="f-mono text-[12px]" style={{ color: C.slateMute }}>{i.isbn}</span>,
            i.totalCopies.toLocaleString(),
            i.checkedOut.toLocaleString(),
            i.lost,
            i.lowStock > 0
              ? <Badge key={`low-${idx}`} tone="stamp">{i.lowStock}</Badge>
              : <span key={`low-${idx}`} style={{ color: C.slateMute }}>—</span>,
            source === "mock" && (
              <button
                key={`rc-${idx}`}
                onClick={() => showToast(`Recount requested for ${i.branch}`, "brass")}
                className="f-body text-[12px] px-2.5 py-1 rounded"
                style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
              >
                Request recount
              </button>
            ),
          ].filter(Boolean))}
          emptyMessage="No inventory data."
        />
      </Card>
    </>
  );
}
