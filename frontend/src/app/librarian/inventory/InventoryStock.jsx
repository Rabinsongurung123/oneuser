"use client";

import { useState } from "react";
import { Boxes, RefreshCw, AlertTriangle } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import StatCard from "@/components/ui-lib/StatCard";
import { useToast } from "@/components/ui-lib/Toast";
import { inventory as initialInventory } from "@/lib/mock-data";

export default function InventoryStock() {
  const [inventory, setInventory] = useState(initialInventory);
  const showToast = useToast();

  const totalCopies = inventory.reduce((s, i) => s + i.totalCopies, 0);
  const checkedOut = inventory.reduce((s, i) => s + i.checkedOut, 0);
  const lost = inventory.reduce((s, i) => s + i.lost, 0);
  const lowStock = inventory.reduce((s, i) => s + i.lowStock, 0);

  return (
    <>
      <PageHeader title="Inventory" subtitle="Stock levels and shrinkage by branch." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Copies" value={totalCopies.toLocaleString()} icon={Boxes} />
        <StatCard label="Checked Out" value={checkedOut.toLocaleString()} icon={RefreshCw} />
        <StatCard label="Reported Lost" value={lost} icon={AlertTriangle} />
        <StatCard label="Low Stock Titles" value={lowStock} icon={AlertTriangle} />
      </div>
      <Card title="By Branch">
        <Table
          columns={["Branch", "Total Copies", "Checked Out", "Lost", "Low Stock Titles", ""]}
          rows={inventory.map((i) => [
            <span key="branch" className="font-medium">{i.branch}</span>,
            i.totalCopies.toLocaleString(),
            i.checkedOut.toLocaleString(),
            i.lost,
            i.lowStock > 4 ? <Badge key="low" tone="stamp">{i.lowStock}</Badge> : i.lowStock,
            <button
              key="recount"
              onClick={() => showToast(`Recount requested for ${i.branch}`, "brass")}
              className="f-body text-[12px] px-2.5 py-1 rounded"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Request recount
            </button>,
          ])}
          emptyMessage="No inventory data."
        />
      </Card>
    </>
  );
}

