"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { C } from "./theme";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 20, 30, 0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md shadow-xl"
        style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.paperLine}` }}>
          <h3 className="f-display text-[17px]" style={{ color: C.ink }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:opacity-70"
            style={{ color: C.slateMute }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: `1px solid ${C.paperLine}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
