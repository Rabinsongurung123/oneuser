"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { C } from "./theme";
import { useAuth } from "./AuthContext";

export default function TopBar({ title, subtitle, userLabel = "Admin", userInitials = "AD" }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking anywhere outside it.
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const signOut = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } finally {
      router.push("/guest/login?signedOut=1");
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-3.5" style={{ background: C.paperCard, borderBottom: `1px solid ${C.paperLine}` }}>
      <div>
        <p className="f-body text-[11.5px]" style={{ color: C.slateMute }}>
          {subtitle} / <span style={{ color: C.slate }}>{title}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative cursor-pointer">
          <Bell size={17} style={{ color: C.slate }} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: C.stamp }} />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 pl-4 cursor-pointer"
            style={{ borderLeft: `1px solid ${C.paperLine}` }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center f-body text-[12px] font-medium" style={{ background: C.brassSoft, color: "#8A6A2E" }}>{userInitials}</div>
            <div className="text-left">
              <p className="f-body text-[12.5px] font-medium leading-none" style={{ color: C.slate }}>{userLabel}</p>
            </div>
            <ChevronDown size={14} style={{ color: C.slateMute }} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-60 rounded-md shadow-lg z-40"
              style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.paperLine}` }}>
                <p className="f-body text-[13px] font-medium" style={{ color: C.slate }}>{user?.name || userLabel}</p>
                <p className="f-body text-[11.5px] mt-0.5 truncate" style={{ color: C.slateMute }}>{user?.email || ""}</p>
              </div>
              <button
                role="menuitem"
                onClick={signOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 f-body text-[12.5px] font-medium cursor-pointer transition-colors"
                style={{ color: C.stamp }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.paper)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
