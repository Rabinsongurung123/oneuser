"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import { useToast } from "@/components/ui-lib/Toast";
import { roleDefs, permissionMatrix, permGrant } from "@/lib/mock-data";

export default function RolePermissions() {
  const [grant, setGrant] = useState(() => JSON.parse(JSON.stringify(permGrant)));
  const showToast = useToast();

  const toggle = (role, perm) => {
    setGrant((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
    showToast(`${perm} ${grant[role][perm] ? "revoked" : "granted"} for ${role}`, "brass");
  };

  return (
    <>
      <PageHeader title="Role & Permission Management" subtitle="Define what each role can see and do." />
      <div
        className="px-4 py-3 rounded-md f-body text-[12.5px] mb-4"
        style={{ background: C.brassSoft, color: "#8A6A2E", border: `1px solid #DEC88A` }}
      >
        No backend API for roles — permissions are saved locally and will reset on refresh.
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {roleDefs.map((r) => (
          <Card key={r.name} title={r.name}>
            <p className="f-body text-[13px]" style={{ color: C.slateMute }}>{r.desc}</p>
          </Card>
        ))}
      </div>
      <Card title="Permission Matrix">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.paperLine}` }}>
                <th className="text-left f-body text-[11px] uppercase tracking-wide py-2" style={{ color: C.slateMute }}>Permission</th>
                {roleDefs.map((r) => (
                  <th key={r.name} className="text-center f-body text-[11px] uppercase tracking-wide py-2 w-28" style={{ color: C.slateMute }}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((p) => (
                <tr key={p} style={{ borderBottom: `1px solid ${C.paperLine}` }}>
                  <td className="py-2.5 f-body text-[13px]" style={{ color: C.slate }}>{p}</td>
                  {roleDefs.map((r) => {
                    const isAdmin = r.name === "Admin";
                    if (isAdmin) {
                      return (
                        <td key={r.name} className="text-center py-2.5">
                          <CheckCircle2 size={16} style={{ color: C.slateMute, display: "inline", opacity: 0.5 }} />
                        </td>
                      );
                    }
                    return (
                      <td key={r.name} className="text-center py-2.5">
                        <button
                          onClick={() => toggle(r.name, p)}
                          aria-label={`Toggle ${p} for ${r.name}`}
                          className="p-1 rounded hover:opacity-70"
                        >
                          {grant[r.name][p]
                            ? <CheckCircle2 size={16} style={{ color: C.sage, display: "inline" }} />
                            : <span style={{ color: C.paperLine }}>—</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
