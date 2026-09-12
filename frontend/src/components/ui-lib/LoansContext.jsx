"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { loans as mockLoans } from "@/lib/mock-data";
import * as backend from "@/lib/backend";

const LoansContext = createContext(null);

const addDays = (d, n) => new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

export function LoansProvider({ children }) {
  const { user } = useAuth();
  const isMember = user?.role === "MEMBER";

  const [loans, setLoans] = useState(mockLoans);
  const [source, setSource] = useState("loading");

  const load = useCallback(async () => {
    try {
      const data = isMember ? await backend.listMyLoans(user.id) : await backend.listLoans();
      return { data, source: "api" };
    } catch (err) {
      console.error("Loans load failed — showing demo data", err);
      const fallback = isMember ? mockLoans.filter((l) => l.member === "Maria Solis") : mockLoans;
      return { data: fallback, source: "mock" };
    }
  }, [isMember, user]);

  useEffect(() => {
    let active = true;
    load().then((r) => {
      if (!active) return;
      setLoans(r.data);
      setSource(r.source);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const reload = useCallback(() => load().then((r) => {
    setLoans(r.data);
    setSource(r.source);
  }), [load]);

  // Local (mock-mode) helpers
  const addLoan = (loan) => setLoans((prev) => [...prev, loan]);
  const removeLocalLoan = (member, title) =>
    setLoans((prev) => prev.filter((l) => !(l.member === member && l.title === title)));
  const renewLocalLoan = (member, title) =>
    setLoans((prev) =>
      prev.map((l) =>
        l.member === member && l.title === title ? { ...l, due: addDays(new Date(l.due), 14) } : l
      )
    );

  const checkoutLoan = async ({ member, title, due }) => {
    if (source === "api") {
      const memberRec = await backend.findUserByName(member);
      if (!memberRec) throw new Error(`No member found matching "${member}"`);
      const book = await backend.findBookByTitle(title);
      if (!book) throw new Error(`No catalog title found matching "${title}"`);
      await backend.createLoan({ userId: memberRec.id, bookId: book.id, dueDate: due });
      await reload();
      return;
    }
    addLoan({ member, title, checked: today(), due, status: "On time" });
  };

  const returnLoan = async (id, member, title) => {
    if (source === "api") {
      await backend.returnLoan(id);
      await reload();
      return;
    }
    removeLocalLoan(member, title);
  };

  const renewLoan = async (id, member, title) => {
    if (source === "api") {
      await backend.renewLoan(id);
      await reload();
      return;
    }
    renewLocalLoan(member, title);
  };

  return (
    <LoansContext.Provider
      value={{
        loans,
        source,
        reload,
        addLoan,
        checkoutLoan,
        returnLoan,
        renewLoan,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
}

export function useLoans() {
  const ctx = useContext(LoansContext);
  if (!ctx) throw new Error("useLoans must be used inside LoansProvider");
  return ctx;
}
