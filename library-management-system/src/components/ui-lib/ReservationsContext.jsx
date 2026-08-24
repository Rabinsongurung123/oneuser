"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { reservations as mockReservations } from "@/lib/mock-data";
import * as backend from "@/lib/backend";

const ReservationsContext = createContext(null);

export function ReservationsProvider({ children }) {
  const { user } = useAuth();
  const isMember = user?.role === "MEMBER";

  const [reservations, setReservations] = useState(mockReservations);
  const [source, setSource] = useState("loading");

  const load = useCallback(async () => {
    try {
      const data = isMember ? await backend.listMyReservations() : await backend.listReservations();
      return { data, source: "api" };
    } catch (err) {
      console.error("Reservations load failed — showing demo data", err);
      const fallback = isMember
        ? mockReservations.filter((r) => r.member === "Maria Solis")
        : mockReservations;
      return { data: fallback, source: "mock" };
    }
  }, [isMember]);

  useEffect(() => {
    let active = true;
    load().then((r) => {
      if (!active) return;
      setReservations(r.data);
      setSource(r.source);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const reload = useCallback(() => load().then((r) => {
    setReservations(r.data);
    setSource(r.source);
  }), [load]);

  const addReservation = async (book) => {
    if (source === "api") {
      await backend.createReservation(book.id);
      await reload();
      return;
    }
    setReservations((prev) => [
      ...prev,
      { position: prev.length + 1, status: "Waiting", member: user?.name || "Maria Solis", title: book.title },
    ]);
  };

  const cancelReservation = async (reservation) => {
    if (source === "api") {
      await backend.cancelReservation(reservation.id);
      await reload();
      return;
    }
    setReservations((prev) =>
      prev.filter((r) => !(r.member === reservation.member && r.title === reservation.title))
    );
  };

  return (
    <ReservationsContext.Provider
      value={{ reservations, source, reload, addReservation, cancelReservation }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error("useReservations must be used inside ReservationsProvider");
  return ctx;
}
