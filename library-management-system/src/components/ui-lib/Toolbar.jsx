"use client";

import { Search, Plus } from "lucide-react";
import { C } from "./theme";

export default function Toolbar({
  placeholder,
  buttonLabel,
  onButton = () => {},
  search = "",
  onSearchChange = () => {},
  filterOptions,
  filterValue = "",
  onFilterChange = () => {},
}) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-md flex-1 max-w-sm" style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}>
        <Search size={15} style={{ color: C.slateMute }} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="f-body text-[13px] bg-transparent outline-none w-full"
          style={{ color: C.slate }}
        />
      </div>
      {filterOptions && (
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer"
          style={{ background: C.paperCard, border: `1px solid ${C.paperLine}`, color: C.slate }}
        >
          <option value="">All</option>
          {filterOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {buttonLabel && (
        <button onClick={onButton} className="flex items-center gap-2 px-3.5 py-2 rounded-md f-body text-[13px] font-medium" style={{ background: C.ink, color: C.paper }}>
          <Plus size={14} /> {buttonLabel}
        </button>
      )}
    </div>
  );
}
