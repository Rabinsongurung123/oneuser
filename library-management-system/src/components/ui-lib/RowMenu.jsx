"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { C } from "./theme";

export default function RowMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="p-1 rounded hover:opacity-70"
        style={{ color: C.slateMute }}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md py-1 shadow-lg"
          style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                item.onClick && item.onClick();
              }}
              className="w-full text-left px-3 py-2 f-body text-[13px] hover:opacity-70"
              style={{ color: item.danger ? C.stamp : C.slate }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
