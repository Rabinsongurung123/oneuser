"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { C } from "@/components/ui-lib/theme";
import { useToast } from "@/components/ui-lib/Toast";

const initialPrefs = [
  { name: "New reservation ready for pickup", trigger: "Notify me when a hold is ready", enabled: true },
  { name: "Item returned damaged", trigger: "Alert me when a returned item is damaged", enabled: true },
  { name: "Daily overdue summary email", trigger: "A daily digest of overdue items at my branch", enabled: false },
];

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState(initialPrefs);
  const showToast = useToast();

  const toggle = (name) => {
    setPrefs((prev) =>
      prev.map((n) => (n.name === name ? { ...n, enabled: !n.enabled } : n))
    );
    const item = prefs.find((n) => n.name === name);
    const next = item ? !item.enabled : true;
    showToast(next ? `${name} enabled` : `${name} disabled`, next ? "sage" : "slate");
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Your personal notification preferences." />
      <Card title="Email Preferences">
        <div className="divide-y" style={{ borderColor: C.paperLine }}>
          {prefs.map((n) => (
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
