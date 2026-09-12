"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useReservations } from "@/components/ui-lib/ReservationsContext";

export default function MyReservations() {
  const { reservations, source, cancelReservation } = useReservations();
  const [confirmCancel, setConfirmCancel] = useState(null);
  const showToast = useToast();

  const myReservations = reservations || [];

  const cancel = async (reservation) => {
    try {
      await cancelReservation(reservation);
      showToast("Reservation cancelled", "stamp");
    } catch (err) {
      showToast(err.message || "Could not cancel reservation", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="My Reservations" subtitle="Your holds on titles in the collection." />
      {source === "mock" && <DemoBanner />}
      <Card>
        <Table
          columns={["Title", "Queue Position", "Status", ""]}
          rows={myReservations.map((r) => [
            <span key="title" className="font-medium">{r.title}</span>,
            <span key="pos">#{r.position}</span>,
            <Badge key="status" tone={r.status === "Ready for pickup" ? "sage" : r.status === "Waiting" ? "brass" : "slate"}>{r.status}</Badge>,
            r.status === "Waiting" ? (
              <button
                key="cancel"
                onClick={() => setConfirmCancel(r)}
                className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
                style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.stamp }}
              >
                Cancel
              </button>
            ) : null,
          ])}
          emptyMessage="You have no reservations."
        />
      </Card>

      <ConfirmDialog
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => {
          const r = confirmCancel;
          setConfirmCancel(null);
          cancel(r);
        }}
        title="Cancel reservation?"
        message={`This will remove your hold on "${confirmCancel?.title}".`}
        confirmLabel="Cancel Reservation"
        danger
      />
    </>
  );
}
