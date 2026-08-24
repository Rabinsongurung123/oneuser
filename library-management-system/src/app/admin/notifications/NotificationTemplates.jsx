"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { C } from "@/components/ui-lib/theme";
import { useToast } from "@/components/ui-lib/Toast";
import { notifTemplates } from "@/lib/mock-data";

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState(notifTemplates);
  const showToast = useToast();

  const toggle = (name) => {
    setTemplates((prev) =>
      prev.map((n) => (n.name === name ? { ...n, enabled: !n.enabled } : n))
    );
    const tpl = templates.find((n) => n.name === name);
    const next = tpl ? !tpl.enabled : true;
    showToast(next ? `${name} enabled` : `${name} disabled`, next ? "sage" : "slate");
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="System notification templates and triggers." />
      <div
        className="px-4 py-3 rounded-md f-body text-[12.5px] mb-4"
        style={{ background: C.brassSoft, color: "#8A6A2E", border: `1px solid #DEC88A` }}
      >
        No backend API for notifications — toggles are saved locally and will reset on refresh.
      </div>
      <Card>
        <div className="divide-y" style={{ borderColor: C.paperLine }}>
          {templates.map((n) => (
            <div key={n.name} className="flex items-center justify-between py-3.5" style={{ borderColor: C.paperLine }}>
              <div>
                <p className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{n.name}</p>
                <p className="f-body text-[12px]" style={{ color: C.slateMute }}>{n.trigger}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(n.name)}
                className="w-9 h-5 rounded-full relative cursor-pointer transition-colors"
                style={{ background: n.enabled ? C.sage : "#DADFE6" }}
                aria-pressed={n.enabled}
                aria-label={`Toggle ${n.name}`}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: n.enabled ? 18 : 2 }} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
