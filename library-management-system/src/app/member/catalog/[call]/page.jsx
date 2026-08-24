"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useReservations } from "@/components/ui-lib/ReservationsContext";
import { useApiData } from "@/components/ui-lib/useApiData";
import { catalog as mockCatalog, branches, CURRENT_MEMBER } from "@/lib/mock-data";
import { getBook } from "@/lib/backend";

export default function BookDetails() {
  const params = useParams();
  const key = decodeURIComponent(params.call);
  const showToast = useToast();
  const { addReservation } = useReservations();

  const { data: book, source } = useApiData(
    () => getBook(key),
    mockCatalog.find((c) => c.call === key),
    [key]
  );

  if (!book) {
    return (
      <>
        <PageHeader title="Book not found" subtitle="No matching title in the catalog." />
        <Link href="/member/catalog" className="f-body text-[13px] no-underline" style={{ color: C.brass }}>
          ← Back to catalog
        </Link>
      </>
    );
  }

  const reserve = async () => {
    try {
      await addReservation(book);
      showToast("Reservation placed", "sage");
    } catch (err) {
      showToast(err.message || "Could not place reservation", "stamp");
    }
  };

  return (
    <>
      <Link href="/member/catalog" className="f-body text-[13px] no-underline inline-flex items-center gap-1.5 mb-4" style={{ color: C.brass }}>
        <ArrowLeft size={14} /> Back to catalog
      </Link>
      {source === "mock" && <DemoBanner />}
      <PageHeader title={book.title} subtitle={`${book.call} · ${book.author}`} />
      <div className="grid grid-cols-3 gap-4">
        <Card title="Availability" className="col-span-1">
          <div className="flex items-center gap-3">
            <Badge tone={book.available > 0 ? "sage" : "stamp"}>
              {book.available > 0 ? `${book.available} of ${book.copies} available` : "All checked out"}
            </Badge>
          </div>
          <p className="f-body text-[13px] mt-3" style={{ color: C.slateMute }}>
            {book.genre}
          </p>
          {book.available === 0 && (
            <button
              onClick={reserve}
              className="mt-5 px-4 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
              style={{ background: C.brass, color: "#fff" }}
            >
              Reserve
            </button>
          )}
          {book.available > 0 && (
            <p className="f-body text-[12.5px] mt-5" style={{ color: C.sage }}>
              Available to borrow — ask a librarian to check it out for you.
            </p>
          )}
        </Card>

        <Card title={source === "api" ? "Copies in the system" : "Copies at your branch"} className="col-span-2">
          <div className="space-y-2.5">
            {source === "api" ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>Total copies</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="f-mono text-[12px]" style={{ color: C.slateMute }}>
                    {book.available} of {book.copies} available
                  </span>
                  <Badge tone={book.available > 0 ? "sage" : "stamp"}>
                    {book.available > 0 ? "Available" : "Checked out"}
                  </Badge>
                </div>
              </div>
            ) : (
              branches.map((b) => {
                const isHome = b.name === `${CURRENT_MEMBER.branch} Library` || b.name.startsWith(CURRENT_MEMBER.branch);
                return (
                  <div key={b.name} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.paperLine}` }}>
                    <div className="flex items-center gap-2">
                      <span className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{b.name}</span>
                      {isHome && <Badge tone="brass">Your branch</Badge>}
                    </div>
                    <span className="f-body text-[12.5px]" style={{ color: C.slateMute }}>{b.status}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
