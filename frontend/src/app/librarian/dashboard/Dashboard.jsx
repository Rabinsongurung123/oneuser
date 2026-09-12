"use client";

import { RefreshCw, CalendarClock, AlertTriangle, BookMarked } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import StatCard from "@/components/ui-lib/StatCard";
import Card from "@/components/ui-lib/Card";
import PageHeader from "@/components/ui-lib/PageHeader";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import SignOutButton from "@/components/ui-lib/SignOutButton";
import WelcomeToast from "@/components/ui-lib/WelcomeToast";
import { C } from "@/components/ui-lib/theme";
import { useApiData } from "@/components/ui-lib/useApiData";
import { circulationTrend, loans as mockLoans, reservations as mockReservations } from "@/lib/mock-data";
import { getDashboardStats, listLoans, listReservations } from "@/lib/backend";

const today = () => new Date().toISOString().slice(0, 10);

async function loadDashboard() {
  const [stats, loans, reservations] = await Promise.all([
    getDashboardStats(),
    listLoans(),
    listReservations(),
  ]);
  return { stats, loans, reservations };
}

export default function LibraryDashboard() {
  const { data, source } = useApiData(loadDashboard, {
    stats: { borrowedBooks: mockLoans.length, overdueBooks: mockLoans.filter((l) => l.status === "Overdue").length },
    loans: mockLoans,
    reservations: mockReservations,
  });

  const stats = data?.stats || {};
  const loans = data?.loans || [];
  const reservations = data?.reservations || [];

  const activeLoans = stats.borrowedBooks ?? loans.length;
  const dueToday = loans.filter((l) => l.due === today()).length;
  const overdue = stats.overdueBooks ?? loans.filter((l) => l.status === "Overdue").length;
  const pendingReservations = reservations.filter(
    (r) => r.status === "Waiting" || r.status === "Ready for pickup"
  ).length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick view of your branch activity — updated just now." action={<SignOutButton />} />
      <WelcomeToast />
      {source === "mock" && <DemoBanner />}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Loans" value={activeLoans} icon={RefreshCw} />
        <StatCard label="Due Today" value={dueToday} icon={CalendarClock} />
        <StatCard label="Overdue" value={overdue} icon={AlertTriangle} />
        <StatCard label="Pending Reservations" value={pendingReservations} icon={BookMarked} />
      </div>

      <Card title="Circulation Trend">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={circulationTrend}>
            <CartesianGrid stroke={C.paperLine} vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 12, fill: C.slateMute }} axisLine={{ stroke: C.paperLine }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.slateMute }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 6, border: `1px solid ${C.paperLine}`, fontSize: 12, fontFamily: "Inter" }} />
            <Line type="monotone" dataKey="checkouts" stroke={C.stamp} strokeWidth={2} dot={false} name="Checkouts" />
            <Line type="monotone" dataKey="returns" stroke={C.brass} strokeWidth={2} dot={false} name="Returns" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
