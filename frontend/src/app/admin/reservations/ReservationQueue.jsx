"use client";

import { useState } from "react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Table from "@/components/ui-lib/Table";
import Badge from "@/components/ui-lib/Badge";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import Modal from "@/components/ui-lib/Modal";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import { useToast } from "@/components/ui-lib/Toast";
import { useApiData } from "@/components/ui-lib/useApiData";
import { reservations as mockReservations } from "@/lib/mock-data";
import { listReservations, createReservation, cancelReservation, listUsers, listBooks } from "@/lib/backend";

export default function ReservationQueue() {
  const { data: reservations, source, reload } = useApiData(listReservations, mockReservations);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ userId: "", bookId: "" });
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  const rows = reservations || [];

  const openNew = async () => {
    setForm({ userId: "", bookId: "" });
    setNewOpen(true);
    try {
      const [u, b] = await Promise.all([listUsers(), listBooks()]);
      setUsers(u.filter((x) => x.role === "Member"));
      setBooks(b.filter((x) => (x.available ?? 0) === 0 && (x.copies ?? 0) > 0));
    } catch {
      // lists stay empty; selects will show the empty option
    }
  };

  const submitNew = async () => {
    if (!form.userId || !form.bookId) {
      showToast("Pick a member and a title", "stamp");
      return;
    }
    setBusy(true);
    try {
      await createReservation(form.bookId, form.userId);
      showToast("Reservation created", "sage");
      setNewOpen(false);
      await reload();
    } catch (err) {
      showToast(err.message || "Could not create reservation", "stamp");
    } finally {
      setBusy(false);
    }
  };

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
      <PageHeader
        title="Reservations"
        subtitle="Hold queue across all titles."
        action={
          <button
            onClick={openNew}
            className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
            style={{ background: C.ink, color: C.paper }}
          >
            New Reservation
          </button>
        }
      />
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

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Reservation"
        footer={
          <>
            <button
              onClick={() => setNewOpen(false)}
              className="px-3.5 py-2 rounded-md f-body text-[13px]"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              Cancel
            </button>
            <button
              onClick={submitNew}
              disabled={busy}
              className="px-3.5 py-2 rounded-md f-body text-[13px] font-medium"
              style={{ background: C.ink, color: C.paper, opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Saving…" : "Create Reservation"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Member</label>
            <select
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              <option value="">Select a member…</option>
              {users.map((u) => (
                <option key={u.backendId} value={u.backendId}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>Title (fully checked out)</label>
            <select
              value={form.bookId}
              onChange={(e) => setForm((f) => ({ ...f, bookId: e.target.value }))}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none cursor-pointer"
              style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
            >
              <option value="">Select a title…</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title} — 0 of {b.copies} available</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

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
