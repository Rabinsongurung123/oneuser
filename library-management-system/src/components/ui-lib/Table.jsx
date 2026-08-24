import { C } from "./theme";

export default function Table({ columns, rows, emptyMessage = "No records found." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${C.paperLine}` }}>
            {columns.map((c) => (
              <th key={c} className="f-body text-[11px] uppercase tracking-wide py-2 pr-4" style={{ color: C.slateMute }}>{c}</th>
            ))}
          </tr>
        </thead>
        {rows.length === 0 && emptyMessage ? (
          <tbody>
            <tr>
              <td colSpan={columns.length} className="py-8 text-center f-body text-[13px]" style={{ color: C.slateMute }}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        ) : rows.length === 0 ? null : (
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.paperLine}` }}>
                {r.map((cell, j) => (
                  <td key={j} className="py-3 pr-4 f-body text-[13px]" style={{ color: C.slate }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
