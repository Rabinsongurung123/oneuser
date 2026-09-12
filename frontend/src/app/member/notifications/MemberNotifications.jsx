"use client";

import { useState } from "react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { C } from "@/components/ui-lib/theme";
import { useToast } from "@/components/ui-lib/Toast";

const initialPrefs = [
  { name: "Due date reminders", enabled: true },
  { name: "Reservation ready alerts", enabled: true },
  { name: "Fine notices", enabled: true },
];

export default function MemberNotifications() {
  const [prefs, setPrefs] = useState(initialPrefs);
  const showToast = useToast();

  const toggle = (name) => {
    setPrefs((prev) =>
      prev.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p))
    );
    const pref = prefs.find((p) => p.name === name);
    const next = pref ? !pref.enabled : true;
    showToast(next ? `${name} enabled` : `${name} disabled`, next ? "sage" : "slate");
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Manage what you hear about." />
      <Card>
        <div className="divide-y" style={{ borderColor: C.paperLine }}>
          {prefs.map((p) => (
            <div key={p.name} className="flex items-center justify-between py-3.5" style={{ borderColor: C.paperLine }}>
              <p className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{p.name}</p>
              <button
                type="button"
                onClick={() => toggle(p.name)}
                className="w-9 h-5 rounded-full relative cursor-pointer transition-colors"
                style={{ background: p.enabled ? C.sage : "#DADFE6" }}
                aria-pressed={p.enabled}
                aria-label={`Toggle ${p.name}`}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: p.enabled ? 18 : 2 }} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
