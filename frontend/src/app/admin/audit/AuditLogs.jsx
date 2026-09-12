"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useApiData } from "@/components/ui-lib/useApiData";
import { auditLogs as mockAuditLogs } from "@/lib/mock-data";
import { listAuditLogs } from "@/lib/backend";

export default function AuditLogs() {
  const { data: logs, source } = useApiData(listAuditLogs, mockAuditLogs);
  const [search, setSearch] = useState("");

  const rows = logs || [];

  const filtered = rows.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="System-wide action history from live borrow records." />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by user or action…"
        search={search}
        onSearchChange={setSearch}
      />
      <Card>
        <Table
          columns={["Date", "User", "Action", "IP Address"]}
          rows={filtered.map((a, i) => [
            <span key={`t-${i}`} className="f-mono text-[12px]" style={{ color: C.slateMute }}>{a.time}</span>,
            <span key={`u-${i}`} className="font-medium">{a.user}</span>,
            <span key={`a-${i}`}>{a.action}</span>,
            <span key={`ip-${i}`} className="f-mono text-[12px]" style={{ color: C.slateMute }}>{a.ip}</span>,
          ])}
          emptyMessage="No matching log entries."
        />
      </Card>
    </>
  );
}
