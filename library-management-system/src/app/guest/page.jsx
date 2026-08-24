import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Library, MapPin, Search, Sparkles, UserRound } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import Badge from "@/components/ui-lib/Badge";
import { catalog, branches } from "@/lib/mock-data";

const featured = catalog.filter((c) => c.featured).slice(0, 3);

export default function GuestHome() {
  return (
    <div className="space-y-14">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="rounded-lg overflow-hidden"
        style={{ background: C.ink }}
      >
        <div className="px-6 sm:px-10 py-14 sm:py-16">
          <p
            className="f-body text-[11px] uppercase tracking-[0.22em] flex items-center gap-2 mb-4"
            style={{ color: C.brass }}
          >
            <Sparkles size={13} /> Fernbridge Public Library
          </p>
          <h1 className="f-display text-[34px] sm:text-[44px] leading-[1.08] max-w-2xl" style={{ color: C.paper }}>
            Your community&apos;s shelves, always open.
          </h1>
          <p className="f-body text-[15px] mt-4 max-w-xl leading-relaxed" style={{ color: "rgba(246,243,236,0.75)" }}>
            Browse tens of thousands of titles, check availability at every branch, and reserve what you love —
            free for everyone in the Fernbridge community.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              href="/guest/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md f-body text-[13.5px] font-medium no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: C.brass, color: "#fff" }}
            >
              Browse the catalog <ArrowRight size={15} />
            </Link>
            <Link
              href="/guest/branches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md f-body text-[13.5px] font-medium no-underline transition-colors hover:opacity-80"
              style={{ border: `1px solid rgba(246,243,236,0.35)`, color: C.paper }}
            >
              <MapPin size={15} /> Find a branch
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8" style={{ borderTop: `1px solid rgba(246,243,236,0.15)` }}>
            {[
              { value: "33k+", label: "Catalog titles" },
              { value: "4", label: "Neighborhood branches" },
              { value: "7 days", label: "Open every week" },
              { value: "$0", label: "Membership cost" },
            ].map((s) => (
              <div key={s.label}>
                <p className="f-display text-[24px]" style={{ color: C.paper }}>{s.value}</p>
                <p className="f-body text-[12px] mt-0.5" style={{ color: "rgba(246,243,236,0.6)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Staff picks ──────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="f-display text-[24px]" style={{ color: C.ink }}>Staff picks</h2>
            <p className="f-body text-[13.5px] mt-1" style={{ color: C.slateMute }}>
              A few favorites our librarians keep recommending.
            </p>
          </div>
          <Link href="/guest/catalog" className="f-body text-[13px] font-medium no-underline inline-flex items-center gap-1 hover:gap-2 transition-all" style={{ color: C.brass }}>
            View all titles <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map((book) => (
            <Link
              key={book.call}
              href={`/guest/catalog/${encodeURIComponent(book.call)}`}
              className="rounded-md p-5 block no-underline transition-transform hover:-translate-y-1"
              style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="f-mono text-[11.5px]" style={{ color: C.slateMute }}>{book.call}</span>
                <Badge tone={book.available > 0 ? "sage" : "stamp"}>
                  {book.available > 0 ? `${book.available} available` : "All checked out"}
                </Badge>
              </div>
              <h3 className="f-display text-[17px] leading-snug" style={{ color: C.ink }}>{book.title}</h3>
              <p className="f-body text-[13px] mt-1" style={{ color: C.slateMute }}>{book.author} · {book.year}</p>
              <p className="f-body text-[12.5px] mt-3 leading-relaxed line-clamp-3" style={{ color: C.slate }}>
                {book.desc}
              </p>
              <span className="f-body text-[12.5px] font-medium inline-flex items-center gap-1 mt-4" style={{ color: C.brass }}>
                Details <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How to borrow ────────────────────────────────── */}
      <section>
        <h2 className="f-display text-[24px] mb-5" style={{ color: C.ink }}>How borrowing works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Search, title: "Find your next read", body: "Search by title, author, or call number and check live availability across all four branches." },
            { icon: BookOpen, title: "Pick it up or reserve", body: "Swing by the shelf to grab it, or reserve it when a copy is checked out — we'll hold it for you." },
            { icon: CalendarClock, title: "Enjoy — and return on time", body: "Standard loans run 2 weeks with free renewals. Return to any branch; we'll handle the rest." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-md p-5" style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-9 h-9 rounded-md" style={{ background: C.brassSoft, color: C.brass }}>
                  <s.icon size={17} />
                </span>
                <span className="f-display text-[26px]" style={{ color: C.paperLine }}>0{i + 1}</span>
              </div>
              <h3 className="f-display text-[16px]" style={{ color: C.ink }}>{s.title}</h3>
              <p className="f-body text-[13px] mt-1.5 leading-relaxed" style={{ color: C.slateMute }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Branches ─────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="f-display text-[24px]" style={{ color: C.ink }}>Visit a branch</h2>
            <p className="f-body text-[13.5px] mt-1" style={{ color: C.slateMute }}>
              Four locations across Fernbridge — with study rooms, Wi-Fi, and more.
            </p>
          </div>
          <Link href="/guest/branches" className="f-body text-[13px] font-medium no-underline inline-flex items-center gap-1 hover:gap-2 transition-all" style={{ color: C.brass }}>
            All branches <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((b) => (
            <Link
              key={b.name}
              href="/guest/branches"
              className="rounded-md p-5 block no-underline transition-transform hover:-translate-y-1"
              style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
            >
              <div className="flex items-start justify-between mb-2">
                <Library size={17} style={{ color: C.brass }} />
                <Badge tone={b.status === "Open" ? "sage" : "brass"}>{b.status}</Badge>
              </div>
              <h3 className="f-display text-[15.5px]" style={{ color: C.ink }}>{b.name}</h3>
              <p className="f-body text-[12.5px] mt-0.5" style={{ color: C.slateMute }}>{b.address}</p>
              <p className="f-body text-[12.5px] mt-2 font-medium" style={{ color: C.slate }}>
                {b.hours}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Join CTA ─────────────────────────────────────── */}
      <section className="rounded-lg overflow-hidden" style={{ background: C.sage }}>
        <div className="px-6 sm:px-10 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="f-display text-[24px]" style={{ color: "#fff" }}>Got a card? Go further.</h2>
            <p className="f-body text-[13.5px] mt-1.5 max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
              Members can manage loans, renew online, reserve titles, and track fines from one dashboard.
            </p>
          </div>
          <Link
            href="/guest/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md f-body text-[13.5px] font-medium no-underline transition-transform hover:-translate-y-0.5 shrink-0"
            style={{ background: "#fff", color: C.sage }}
          >
            <UserRound size={15} /> Log in or register
          </Link>
        </div>
      </section>
    </div>
  );
}
