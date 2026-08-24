"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { getSettings, saveSettings } from "@/lib/backend";

// The backend only persists dailyFineRate + gracePeriodDays.
// libraryName / timezone / loanDuration / maxFine are display-only local fields.
const LOCAL_DEFAULTS = {
  libraryName: "Fernbridge Public Library",
  timezone: "Asia/Kathmandu (UTC+5:45)",
  loanDuration: "14 days",
  maxFine: "$15.00",
};

function Field({ label, value, onChange, hint, type = "text", readOnly = false }) {
  return (
    <div>
      <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        type={type}
        readOnly={readOnly}
        className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
        style={{
          background: readOnly ? C.paperLine : C.paper,
          border: `1px solid ${C.paperLine}`,
          color: readOnly ? C.slateMute : C.slate,
          cursor: readOnly ? "default" : "text",
        }}
      />
      {hint && (
        <p className="f-body text-[11.5px] mt-1" style={{ color: C.slateMute }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function SystemSettings() {
  const [localFields, setLocalFields] = useState(LOCAL_DEFAULTS);
  const showToast = useToast();

  const { data: apiSettings, source, reload } = useApiData(getSettings, {});

  // editable API fields, seeded from the backend once
  const [dailyFineRate, setDailyFineRate] = useState("");
  const [gracePeriodDays, setGracePeriodDays] = useState("");
  const [seeded, setSeeded] = useState(false);

  if (source === "api" && !seeded && apiSettings) {
    setDailyFineRate(String(apiSettings.dailyFineRate ?? 0.25));
    setGracePeriodDays(String(apiSettings.gracePeriodDays ?? 1));
    setSeeded(true);
  }

  const [busy, setBusy] = useState(false);

  const setLocal = (key) => (e) =>
    setLocalFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setBusy(true);
    try {
      await saveSettings({
        dailyFineRate: parseFloat(dailyFineRate) || 0,
        gracePeriodDays: parseInt(gracePeriodDays, 10) || 0,
      });
      await reload();
      showToast("Settings saved", "sage");
    } catch (err) {
      showToast(err.message || "Could not save settings", "stamp");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="System-wide configuration defaults." />
      {source === "mock" && <DemoBanner />}

      <div className="grid grid-cols-2 gap-4">
        {/* display-only (no backend fields yet) */}
        <Card title="General">
          <div className="space-y-4">
            <Field
              label="Library System Name"
              value={localFields.libraryName}
              onChange={setLocal("libraryName")}
              readOnly
              hint="Contact your system administrator to change this."
            />
            <Field
              label="Time Zone"
              value={localFields.timezone}
              onChange={setLocal("timezone")}
              readOnly
            />
            <Field
              label="Default Loan Duration"
              value={localFields.loanDuration}
              onChange={setLocal("loanDuration")}
              readOnly
            />
          </div>
        </Card>

        <Card title="Fines">
          <div className="space-y-4">
            <Field
              label="Daily Overdue Rate ($)"
              value={dailyFineRate}
              onChange={(e) => setDailyFineRate(e.target.value)}
              type="number"
              hint="Amount charged per day after the due date."
            />
            <Field
              label="Maximum Fine per Item ($)"
              value={localFields.maxFine}
              onChange={setLocal("maxFine")}
              readOnly
              hint="Not yet configurable via API."
            />
            <Field
              label="Grace Period (days)"
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(e.target.value)}
              type="number"
              hint="No fine accrues within this window after the due date."
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          onClick={save}
          disabled={busy || source === "loading"}
          className="px-4 py-2 rounded-md f-body text-[13px] font-medium"
          style={{ background: C.ink, color: C.paper, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}
