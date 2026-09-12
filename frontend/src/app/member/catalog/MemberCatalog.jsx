"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
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

const genreOptions = ["All", "Fiction", "Sci-Fi", "Non-fiction", "Children's", "Reference"];

export default function MemberCatalog() {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  const loader = useCallback(() => {
    if (search.trim()) return searchBooks(search);
    if (genreFilter && genreFilter !== "All") return listBooksByCategory(genreFilter);
    return listBooks();
  }, [search, genreFilter]);

  const { data: catalog, source } = useApiData(loader, mockCatalog, [search, genreFilter]);

  return (
    <>
      <PageHeader title="Search Catalog" subtitle="Browse available titles in the collection." />
      {source === "mock" && <DemoBanner />}
      <Toolbar
        placeholder="Search by title, author, or call number…"
        search={search}
        onSearchChange={setSearch}
        filterOptions={genreOptions}
        filterValue={genreFilter}
        onFilterChange={setGenreFilter}
      />
      <Card>
        <Table
          columns={["Call No.", "Title", "Author", "Genre", "Availability"]}
          rows={(catalog || []).map((c) => [
            <span key="call" className="f-mono text-[12px]" style={{ color: C.slateMute }}>{c.call}</span>,
            <Link
              key="title"
              href={`/member/catalog/${encodeURIComponent(c.id || c.call)}`}
              className="font-medium no-underline hover:underline"
              style={{ color: C.ink }}
            >
              {c.title}
            </Link>,
            c.author,
            <Badge key="genre" tone="brass">{c.genre}</Badge>,
            <Badge key="avail" tone={c.available > 0 ? "sage" : "stamp"}>
              {c.available > 0 ? `${c.available} available` : "All checked out"}
            </Badge>,
          ])}
          emptyMessage="No titles match your search."
        />
      </Card>
    </>
  );
}
