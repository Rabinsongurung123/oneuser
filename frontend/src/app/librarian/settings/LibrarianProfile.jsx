"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { useToast } from "@/components/ui-lib/Toast";

const initialSettings = {
  fullName: "Grace Lindqvist",
  email: "grace.l@library.org",
  branch: "Central",
  notifyByEmail: "Yes",
};

function Field({ label, value, onChange, hint }) {
  return (
    <div>
      <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
        style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
      />
      {hint && <p className="f-body text-[11.5px] mt-1" style={{ color: C.slateMute }}>{hint}</p>}
    </div>
  );
}

export default function LibrarianProfile() {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState(initialSettings);
  const showToast = useToast();

  const dirty = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  const setField = (key) => (e) => setSettings((s) => ({ ...s, [key]: e.target.value }));

  const save = () => {
    setSavedSnapshot(settings);
    showToast("Settings saved", "sage");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your personal librarian profile." />
      <div className="grid grid-cols-2 gap-4">
        <Card title="Profile">
          <div className="space-y-4">
            <Field label="Full Name" value={settings.fullName} onChange={setField("fullName")} />
            <Field label="Email" value={settings.email} onChange={setField("email")} />
          </div>
        </Card>
        <Card title="Preferences">
          <div className="space-y-4">
            <Field label="Branch" value={settings.branch} onChange={setField("branch")} hint="Your home branch." />
            <Field label="Notify by Email" value={settings.notifyByEmail} onChange={setField("notifyByEmail")} hint="Yes / No" />
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-end gap-3 mt-4">
        {dirty && (
          <span className="f-body text-[12px]" style={{ color: C.brass }}>Unsaved changes</span>
        )}
        <button
          onClick={save}
          className="px-4 py-2 rounded-md f-body text-[13px] font-medium"
          style={{ background: C.ink, color: C.paper }}
        >
          Save Changes
        </button>
      </div>
    </>
  );
}
