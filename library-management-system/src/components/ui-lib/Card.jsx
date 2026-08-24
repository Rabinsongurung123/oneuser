import { C } from "./theme";

export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-md ${className}`} style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.paperLine}` }}>
          <h3 className="f-display text-[16px]" style={{ color: C.ink }}>{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
