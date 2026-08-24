import { C } from "./theme";

export default function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: { bg: "#EEF0F4", fg: C.slate },
    sage: { bg: C.sageSoft, fg: C.sage },
    stamp: { bg: C.stampSoft, fg: C.stamp },
    brass: { bg: C.brassSoft, fg: "#8A6A2E" },
  };
  const t = tones[tone];
  return (
    <span className="f-body text-[11.5px] px-2 py-0.5 rounded-full inline-block" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}
