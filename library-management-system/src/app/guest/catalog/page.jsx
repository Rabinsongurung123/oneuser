"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { BookX } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Toolbar from "@/components/ui-lib/Toolbar";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useApiData } from "@/components/ui-lib/useApiData";
import { catalog as mockCatalog } from "@/lib/mock-data";
import { listBooks, searchBooks, listBooksByCategory } from "@/lib/backend";

const genreOptions = ["Fiction", "Sci-Fi", "Non-fiction", "Children's", "Reference"];

export default function PublicCatalog() {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const loader = useCallback(() => {
    if (search.trim()) return searchBooks(search);
    if (genreFilter) return listBooksByCategory(genreFilter);
    return listBooks();
  }, [search, genreFilter]);

  const { data: catalog, source } = useApiData(loader, mockCatalog, [search, genreFilter]);

  const filtered = (catalog || []).filter((c) => !onlyAvailable || c.available > 0);

  return (
    <>
      <PageHeader
        title="Browse the Catalog"
        subtitle="Search the Fernbridge collection and check what's available."
      />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by title, author, or call number…"
        search={search}
        onSearchChange={setSearch}
        filterOptions={genreOptions}
        filterValue={genreFilter}
        onFilterChange={setGenreFilter}
      />
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          aria-pressed={onlyAvailable}
          className="f-body text-[12.5px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors"
          style={
            onlyAvailable
              ? { background: C.sageSoft, color: C.sage, border: `1px solid ${C.sage}` }
              : { background: "transparent", color: C.slateMute, border: `1px solid ${C.paperLine}` }
          }
        >
          {onlyAvailable ? "✓ " : ""}Available now
        </button>
        <span className="f-body text-[12px]" style={{ color: C.slateMute }}>
          {filtered.length} of {(catalog || []).length} titles
        </span>
      </div>
      <Card>
        <Table
          columns={["Call No.", "Title", "Author", "Genre", "Availability"]}
          rows={filtered.map((c) => [
            <span key="call" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{c.call}</span>,
            <Link
              key="title"
              href={`/guest/catalog/${encodeURIComponent(c.id || c.call)}`}
              className="font-medium no-underline hover:underline"
              style={{ color: C.ink }}
            >
              {c.title}
            </Link>,
            c.author,
            <Badge key="genre" tone="brass">{c.genre}</Badge>,
            <Badge key="availability" tone={c.available > 0 ? "sage" : "stamp"}>
              {c.available > 0 ? `${c.available} available` : "All checked out"}
            </Badge>,
          ])}
          emptyMessage=""
        />
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <BookX size={28} className="mx-auto" style={{ color: C.paperLine }} />
            <p className="f-body text-[14px] font-medium mt-3" style={{ color: C.slate }}>No titles match your search</p>
            <p className="f-body text-[12.5px] mt-1" style={{ color: C.slateMute }}>
              {onlyAvailable
                ? "Every matching title is currently checked out. Try turning off \u201cAvailable now\u201d."
                : "Try a different keyword or genre."}
            </p>
          </div>
        )}
      </Card>
    </>
  );
}
