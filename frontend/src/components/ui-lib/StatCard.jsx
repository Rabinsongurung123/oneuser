import { TrendingUp, TrendingDown } from "lucide-react";
import { C } from "./theme";

export default function StatCard({ label, value, delta, up, icon: Icon }) {
  return (
    <div className="rounded-md p-4" style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}>
      <div className="flex items-start justify-between">
        <span className="f-body text-[12px] uppercase tracking-wide" style={{ color: C.slateMute }}>{label}</span>
        <Icon size={16} style={{ color: C.brass }} />
      </div>
      <div className="f-display text-[28px] mt-1" style={{ color: C.ink }}>{value}</div>
      {delta && (
        <div className="flex items-center gap-1 mt-1 f-body text-[12px]" style={{ color: up ? C.sage : C.stamp }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
