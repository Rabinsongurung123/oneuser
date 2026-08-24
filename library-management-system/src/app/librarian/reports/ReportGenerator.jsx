"use client";

import { useState } from "react";
import { FileBarChart2, Download } from "lucide-react";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { C } from "@/components/ui-lib/theme";
import { useToast } from "@/components/ui-lib/Toast";

const reports = [
  { name: "Daily Circulation Summary", desc: "Today's checkouts and returns at your branch." },
  { name: "Overdue Items Report", desc: "Members with items past due." },
];

export default function ReportGenerator() {
  const [status, setStatus] = useState({});
  const showToast = useToast();

  const generate = (name) => {
    setStatus((prev) => ({ ...prev, [name]: { generating: true, lastGenerated: prev[name] ? prev[name].lastGenerated : null } }));
    setTimeout(() => {
      setStatus((prev) => ({
        ...prev,
        [name]: { generating: false, lastGenerated: new Date().toLocaleTimeString() },
      }));
      showToast(`${name} generated`, "sage");
    }, 900);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export operational reports." />
      <div className="grid grid-cols-2 gap-4">
        {reports.map((r) => {
          const st = status[r.name] || { generating: false, lastGenerated: null };
          return (
            <Card key={r.name}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="f-display text-[16px]" style={{ color: C.ink }}>{r.name}</h3>
                  <p className="f-body text-[13px] mt-1" style={{ color: C.slateMute }}>{r.desc}</p>
                </div>
                <FileBarChart2 size={18} style={{ color: C.brass, flexShrink: 0 }} />
              </div>
              <button
                onClick={() => generate(r.name)}
                disabled={st.generating}
                className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-md f-body text-[12.5px]"
                style={{
                  background: st.generating ? C.paperLine : C.paper,
                  border: `1px solid ${st.generating ? C.paperLine : C.paperLine}`,
                  color: st.generating ? C.slateMute : C.slate,
                  cursor: st.generating ? "default" : "pointer",
                }}
              >
                <Download size={13} />
                {st.generating ? "Generating…" : "Generate"}
              </button>
              {st.lastGenerated && (
                <p className="f-body text-[11.5px] mt-2" style={{ color: C.slateMute }}>
                  Last generated: {st.lastGenerated}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

