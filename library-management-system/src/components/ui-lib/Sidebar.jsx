"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { C } from "./theme";

export default function Sidebar({
  navItems = [],
  basePath = "",
  active,
  onNavigate,
  appName = "Fernbridge",
  appSubtitle = "Admin Console",
}) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col sticky top-0 h-screen" style={{ background: C.ink }}>
      <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: C.brass }}>
          <BookOpen size={16} color={C.ink} />
        </div>
        <div>
          <p className="f-display text-[15px] leading-none" style={{ color: C.paper }}>{appName}</p>
          <p className="f-body text-[10.5px] tracking-wide uppercase mt-1" style={{ color: "#8E97AC" }}>{appSubtitle}</p>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = basePath ? `/${basePath}/${item.key}` : `/${item.key}`;
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={href}
              onClick={() => onNavigate && onNavigate(item.key)}
              className="w-full flex items-center gap-3 text-left px-3 py-2.5 f-body text-[13.5px] transition-colors no-underline"
              style={{
                color: isActive ? C.paper : "#AEB6C8",
                background: isActive ? "rgba(184,147,74,0.16)" : "transparent",
                borderLeft: isActive ? `3px solid ${C.brass}` : "3px solid transparent",
              }}
            >
              <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span className="leading-snug">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 f-body text-[11px]" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "#6E7789" }}>
        Library Management System v2.4
      </div>
    </aside>
  );
}

