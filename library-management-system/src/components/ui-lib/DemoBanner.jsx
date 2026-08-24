"use client";

import { C } from "./theme";

export default function DemoBanner({ children }) {
  return (
    <p
      className="f-body text-[11.5px] px-3 py-1.5 rounded-md mb-3"
      style={{ background: C.brassSoft, color: "#8A6A2E", border: `1px solid ${C.brass}` }}
    >
      {children || "Demo data — backend offline. Start the API server to see live data."}
    </p>
  );
}
