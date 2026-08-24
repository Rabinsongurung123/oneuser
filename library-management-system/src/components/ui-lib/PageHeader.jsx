import { C } from "./theme";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="f-display text-[26px]" style={{ color: C.ink }}>{title}</h1>
        {subtitle && <p className="f-body text-[13.5px] mt-1" style={{ color: C.slateMute }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
