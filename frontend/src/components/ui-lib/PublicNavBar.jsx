"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn } from "lucide-react";
import { C } from "./theme";

const LINKS = [
  { label: "Home", href: "/guest" },
  { label: "Catalog", href: "/guest/catalog" },
  { label: "Branches", href: "/guest/branches" },
];

export default function PublicNavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: C.paperCard, borderBottom: `1px solid ${C.paperLine}` }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/guest" className="flex items-baseline gap-2 no-underline shrink-0">
          <span className="f-display text-[22px] leading-none" style={{ color: C.ink }}>
            Fernbridge
          </span>
          <span
            className="f-body text-[10.5px] uppercase tracking-[0.18em] hidden sm:inline"
            style={{ color: C.slateMute }}
          >
            Public Library
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden sm:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="f-body text-[13.5px] font-medium no-underline border-b-2 border-transparent hover:border-current transition-colors"
              style={{ color: C.slate }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <Link
            href="/guest/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md f-body text-[13px] font-medium no-underline transition-colors hover:opacity-90"
            style={{ background: C.ink, color: C.paper }}
          >
            <LogIn size={14} /> Log In
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="sm:hidden p-2 rounded-md cursor-pointer"
          style={{ color: C.ink }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="sm:hidden px-4 pb-4"
          style={{ background: C.paperCard, borderTop: `1px solid ${C.paperLine}` }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 f-body text-[14px] font-medium no-underline"
              style={{ color: C.slate, borderBottom: `1px solid ${C.paperLine}` }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/guest/login"
            onClick={() => setOpen(false)}
            className="block mt-3 text-center px-4 py-2 rounded-md f-body text-[13px] font-medium no-underline"
            style={{ background: C.ink, color: C.paper }}
          >
            Log In
          </Link>
        </div>
      )}
    </header>
  );
}
