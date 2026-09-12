"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { C } from "./theme";

const ToastContext = createContext(null);

const toneStyles = {
  sage: { bg: C.sage, fg: "#fff" },
  stamp: { bg: C.stamp, fg: "#fff" },
  brass: { bg: C.brass, fg: "#fff" },
  slate: { bg: C.inkSoft, fg: "#fff" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, tone = "sage") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {[...toasts].reverse().map((t) => {
          const s = toneStyles[t.tone] || toneStyles.sage;
          return (
            <div
              key={t.id}
              className="px-4 py-2.5 rounded-md shadow-lg f-body text-[13px]"
              style={{ background: s.bg, color: s.fg }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
