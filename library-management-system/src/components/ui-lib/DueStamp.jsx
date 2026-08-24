import { Stamp } from "lucide-react";
import { C } from "./theme";

export default function DueStamp({ date, overdue }) {
  return (
    <span
      className="f-mono text-[11px] px-2 py-1 inline-flex items-center gap-1"
      style={{
        color: overdue ? C.stamp : C.slate,
        border: `1.5px solid ${overdue ? C.stamp : C.paperLine}`,
        borderRadius: 3,
        transform: "rotate(-1deg)",
        letterSpacing: "0.02em",
      }}
    >
      <Stamp size={11} />
      {date}
    </span>
  );
}
