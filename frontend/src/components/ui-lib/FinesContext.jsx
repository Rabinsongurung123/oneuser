"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fines as mockFines } from "@/lib/mock-data";
import * as backend from "@/lib/backend";

const FinesContext = createContext(null);

export function FinesProvider({ children }) {
  const { user } = useAuth();
  const isMember = user?.role === "MEMBER";

  const [fines, setFines] = useState(mockFines);
  const [source, setSource] = useState("loading");

  const load = useCallback(async () => {
    try {
      const data = isMember ? await backend.listMyFines() : await backend.listFines();
      return { data, source: "api" };
    } catch (err) {
      console.error("Fines load failed — showing demo data", err);
      const fallback = isMember ? mockFines.filter((f) => f.member === "Maria Solis") : mockFines;
      return { data: fallback, source: "mock" };
    }
  }, [isMember]);

  useEffect(() => {
    let active = true;
    load().then((r) => {
      if (!active) return;
      setFines(r.data);
      setSource(r.source);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const reload = useCallback(() => load().then((r) => {
    setFines(r.data);
    setSource(r.source);
  }), [load]);

  const payFine = async (fine) => {
    if (source === "api") {
      await backend.payFine(fine.id);
      await reload();
      return;
    }
    setFines((prev) =>
      prev.map((f) =>
        f.member === fine.member && f.reason === fine.reason
          ? { ...f, status: "Paid", paidDate: new Date().toISOString().slice(0, 10) }
          : f
      )
    );
  };

  const waiveFine = async (fine) => {
    if (source === "api") {
      await backend.waiveFine(fine.id);
      await reload();
      return;
    }
    setFines((prev) =>
      prev.map((f) =>
        f.member === fine.member && f.reason === fine.reason ? { ...f, status: "Waived" } : f
      )
    );
  };

  return (
    <FinesContext.Provider value={{ fines, source, reload, payFine, waiveFine }}>
      {children}
    </FinesContext.Provider>
  );
}

export function useFines() {
  const ctx = useContext(FinesContext);
  if (!ctx) throw new Error("useFines must be used inside FinesProvider");
  return ctx;
}
