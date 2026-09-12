"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useApiData } from "@/components/ui-lib/useApiData";
import { catalog as mockCatalog, branches } from "@/lib/mock-data";
import { getBook, listBooks } from "@/lib/backend";

export default function GuestBookDetails() {
  const params = useParams();
  const key = decodeURIComponent(params.call);

  const { data: book, source } = useApiData(
    () => getBook(key),
    mockCatalog.find((c) => c.call === key),
    [key]
  );

  const { data: allBooks } = useApiData(listBooks, mockCatalog, []);

  if (!book) {
    return (
      <>
        <PageHeader title="Book not found" subtitle="No matching title in the catalog." />
        <Link href="/guest/catalog" className="f-body text-[13px] no-underline" style={{ color: C.brass }}>
          ← Back to catalog
        </Link>
      </>
    );
  }

  const related = (allBooks || [])
    .filter((c) => (c.id || c.call) !== (book.id || book.call) && c.genre === book.genre)
    .slice(0, 3);

  const totalAtBranches = book.shelves?.reduce((sum, s) => sum + s.total, 0) ?? book.copies;

  return (
    <>
      <Link
        href="/guest/catalog"
        className="f-body text-[13px] no-underline inline-flex items-center gap-1.5 mb-4"
        style={{ color: C.brass }}
      >
        <ArrowLeft size={14} /> Back to catalog
      </Link>
      {source === "mock" && <DemoBanner />}
      <PageHeader title={book.title} subtitle={`${book.call} · ${book.author}${book.year ? ` · ${book.year}` : ""}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Availability */}
        <Card title="Availability" className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Badge tone={book.available > 0 ? "sage" : "stamp"}>
              {book.available > 0 ? `${book.available} of ${book.copies} available` : "All checked out"}
            </Badge>
          </div>
          <p className="f-body text-[13px] mt-3" style={{ color: C.slateMute }}>
            {book.genre}
          </p>
          {book.available === 0 ? (
            <Link
              href="/guest/login"
              className="mt-5 inline-block w-full text-center px-4 py-2 rounded-md f-body text-[13px] font-medium no-underline hover:opacity-90 transition-opacity"
              style={{ background: C.brass, color: "#fff" }}
            >
              Log in to reserve this title
            </Link>
          ) : (
            <p className="f-body text-[12.5px] mt-5" style={{ color: C.sage }}>
              Available to borrow — ask a librarian to check it out for you.
            </p>
          )}
        </Card>

        {/* Copies by branch */}
        <Card title="Copies by branch" className="lg:col-span-2">
          <div className="space-y-2.5">
            {(book.shelves ?? []).length > 0 ? (
              (book.shelves ?? []).map((s) => {
                const open = s.avail > 0;
                const branchStatus = branches.find((b) => b.name === s.branch)?.status;
                const renovating = branchStatus === "Renovation";
                return (
                  <div
                    key={s.branch}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: `1px solid ${C.paperLine}` }}
                  >
                    <span className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{s.branch}</span>
                    <div className="flex items-center gap-2">
                      {renovating ? (
                        <Badge tone="brass">Closed for renovation</Badge>
                      ) : (
                        <>
                          <span className="f-mono text-[12px]" style={{ color: C.slateMute }}>
                            {s.avail} of {s.total} on shelf
                          </span>
                          <Badge tone={open ? "sage" : "stamp"}>
                            {s.total === 0 ? "Not stocked" : open ? "Available" : "Checked out"}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>
                  Library system
                </span>
                <div className="flex items-center gap-2">
                  <span className="f-mono text-[12px]" style={{ color: C.slateMute }}>
                    {book.available} of {book.copies} on shelf
                  </span>
                  <Badge tone={book.available > 0 ? "sage" : "stamp"}>
                    {book.available > 0 ? "Available" : "Checked out"}
                  </Badge>
                </div>
              </div>
            )}
            <p className="f-body text-[12px] pt-1" style={{ color: C.slateMute }}>
              {totalAtBranches} copies total{(book.shelves?.length ?? 1) > 1 ? ` across ${book.shelves?.length} branch locations` : ""}.
            </p>
          </div>
        </Card>
      </div>

      {/* Description */}
      {book.desc && (
        <Card title="About this title" className="mb-4">
          <p className="f-body text-[13.5px] leading-relaxed max-w-3xl" style={{ color: C.slate }}>
            {book.desc}
          </p>
        </Card>
      )}

      {/* Related titles */}
      {related.length > 0 && (
        <Card title={`More in ${book.genre}`}>
          <div className="space-y-2.5">
            {related.map((r) => (
              <Link
                key={r.id || r.call}
                href={`/guest/catalog/${encodeURIComponent(r.id || r.call)}`}
                className="flex items-center justify-between py-2 no-underline group"
                style={{ borderBottom: `1px solid ${C.paperLine}` }}
              >
                <div>
                  <span className="f-display text-[14.5px]" style={{ color: C.ink }}>{r.title}</span>
                  <span className="f-body text-[12.5px] ml-2" style={{ color: C.slateMute }}>{r.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={r.available > 0 ? "sage" : "stamp"}>
                    {r.available > 0 ? `${r.available} available` : "Checked out"}
                  </Badge>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: C.brass }} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
