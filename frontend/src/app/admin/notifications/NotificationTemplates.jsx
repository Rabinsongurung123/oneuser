"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { listAllNotifications } from "@/lib/backend";
import { C } from "@/components/ui-lib/theme";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "DUE_REMINDER",  channel: "EMAIL", status: "SENT",   sentAt: "2026-09-20", createdAt: "2026-09-20", user: { name: "Alice M.", email: "alice@example.com" } },
  { id: "2", type: "OVERDUE_ALERT", channel: "EMAIL", status: "SENT",   sentAt: "2026-09-18", createdAt: "2026-09-18", user: { name: "Bob K.",   email: "bob@example.com"   } },
  { id: "3", type: "HOLD_READY",    channel: "EMAIL", status: "FAILED",  sentAt: null,         createdAt: "2026-09-15", user: { name: "Carol T.", email: "carol@example.com" } },
];

const TYPE_LABELS = {
  DUE_REMINDER: "Due Reminder",
  OVERDUE_ALERT: "Overdue Alert",
  HOLD_READY: "Hold Ready",
};

const STATUS_TONE = {
  SENT: "sage",
  FAILED: "stamp",
  QUEUED: "brass",
};

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none resize-none"
          style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
          style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
        />
      )}
    </div>
  );
}

export default function NotificationTemplates() {
  const { data: notifications, source } = useApiData(listAllNotifications, MOCK_NOTIFICATIONS);

  const rows = notifications || [];

  return (
    <>
      <PageHeader title="Notifications" subtitle="System notification history." />
      {source === "mock" && <DemoBanner />}

      {/* All notifications log */}
      <Card title="Notification Log">
        <Table
          columns={["Member", "Type", "Channel", "Status", "Date"]}
          rows={rows.map((n) => [
            <span key="user" className="f-body text-[13px] font-medium" style={{ color: C.slate }}>
              {n.user?.name || "—"}
            </span>,
            <span key="type" className="f-body text-[12.5px]" style={{ color: C.slate }}>
              {TYPE_LABELS[n.type] || n.type}
            </span>,
            <span key="channel" className="f-body text-[12.5px]" style={{ color: C.slateMute }}>
              {n.channel}
            </span>,
            <Badge key="status" tone={STATUS_TONE[n.status] || "slate"}>
              {n.status}
            </Badge>,
            <span key="date" className="f-body text-[12.5px]" style={{ color: C.slateMute }}>
              {n.sentAt || n.createdAt || "—"}
            </span>,
          ])}
          emptyMessage="No notifications have been sent yet."
        />
      </Card>
    </>
  );
}
