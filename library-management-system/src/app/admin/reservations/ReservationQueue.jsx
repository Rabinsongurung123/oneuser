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
import { useApiData } from "@/components/ui-lib/useApiData";
import { reservations as mockReservations } from "@/lib/mock-data";
import { listReservations, cancelReservation } from "@/lib/backend";

export default function ReservationQueue() {
  const { data: reservations, source, reload } = useApiData(listReservations, mockReservations);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const showToast = useToast();

  const rows = reservations || [];

  const cancel = async (reservation) => {
    try {
      await cancelReservation(reservation.id);
      await reload();
      showToast("Reservation cancelled", "stamp");
    } catch (err) {
      showToast(err.message || "Could not cancel reservation", "stamp");
    }
  };

  return (
    <>
      <PageHeader title="Reservations" subtitle="Hold queue across all titles." />
      {source === "mock" && <DemoBanner />}
      <Card>
        <Table
          columns={["Member", "Title", "Queue Position", "Status", ""]}
          rows={rows.map((r) => [
            <span key="m" className="font-medium">{r.member}</span>,
            <span key="t">{r.title}</span>,
            <span key="p">#{r.position}</span>,
            <Badge key="s" tone={r.status === "Ready for pickup" ? "sage" : r.status === "Waiting" ? "brass" : "slate"}>{r.status}</Badge>,
            r.status === "Waiting" && (
              <button
                key="btn"
                onClick={() => setConfirmCancel(r)}
                className="f-body text-[12px] px-2.5 py-1 rounded cursor-pointer"
                style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.stamp }}
              >
                Cancel
              </button>
            ),
          ])}
          emptyMessage="No active reservations."
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
        message={`This will remove ${confirmCancel?.member}'s hold on "${confirmCancel?.title}". The queue will shift up.`}
        confirmLabel="Cancel Reservation"
        danger
      />
    </>
  );
}
