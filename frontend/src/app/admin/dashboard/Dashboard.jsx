"use client";

import {
  BookOpen, RefreshCw, AlertTriangle, CircleDollarSign
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import StatCard from "@/components/ui-lib/StatCard";
import Card from "@/components/ui-lib/Card";
import PageHeader from "@/components/ui-lib/PageHeader";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import SignOutButton from "@/components/ui-lib/SignOutButton";
import WelcomeToast from "@/components/ui-lib/WelcomeToast";
import { C } from "@/components/ui-lib/theme";
import { useApiData } from "@/components/ui-lib/useApiData";
import {
  circulationTrend, genreSplit, branchLoad, recentActivity as mockActivity
} from "@/lib/mock-data";
import { getDashboardStats, listFines, activityToUi } from "@/lib/backend";

const genreColors = [C.stamp, C.brass, C.sage, C.ink, C.slateMute];

async function loadDashboard() {
  const [stats, fines] = await Promise.all([getDashboardStats(), listFines()]);
  return { stats, fines };
}

export default function Dashboard() {
  const { data, source } = useApiData(loadDashboard, {
    stats: {
      totalBooks: 33290,
      borrowedBooks: 4100,
      overdueBooks: 212,
      recentBorrowActivity: mockActivity,
    },
    fines: [],
  });

  const stats = data?.stats || {};
  const fines = data?.fines || [];
  const collected = fines
    .filter((f) => f.status === "Paid")
    .reduce((s, f) => s + f.amount, 0);
  const activity = (stats.recentBorrowActivity || []).slice(0, 5).map(activityToUi);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="System-wide overview across all branches — updated just now." action={<SignOutButton />} />
      <WelcomeToast />
      {source === "mock" && <DemoBanner />}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Catalog Items" value={(stats.totalBooks ?? 0).toLocaleString()} icon={BookOpen} />
        <StatCard label="Active Loans" value={(stats.borrowedBooks ?? 0).toLocaleString()} icon={RefreshCw} />
        <StatCard label="Overdue Items" value={(stats.overdueBooks ?? 0).toLocaleString()} icon={AlertTriangle} />
        <StatCard label="Fines Collected" value={`$${collected.toFixed(2)}`} icon={CircleDollarSign} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card title="Circulation Trend" className="col-span-2">
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

        <Card title="Catalog by Genre">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genreSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {genreSplit.map((_, i) => <Cell key={i} fill={genreColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 6, border: `1px solid ${C.paperLine}`, fontSize: 12, fontFamily: "Inter" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Branch Load (active loans)" className="col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={branchLoad}>
              <CartesianGrid stroke={C.paperLine} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.slateMute }} axisLine={{ stroke: C.paperLine }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.slateMute }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, border: `1px solid ${C.paperLine}`, fontSize: 12, fontFamily: "Inter" }} />
              <Bar dataKey="value" fill={C.ink} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Recent Activity">
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="f-body text-[12.5px]" style={{ color: C.slateMute }}>No recent activity.</p>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.type === "alert" ? C.stamp : C.brass }} />
                  <p className="f-body text-[12.5px] leading-snug" style={{ color: C.slate }}>
                    <span className="font-medium">{a.who}</span> {a.action} <span style={{ color: C.slateMute }}>{a.what}</span>
                    <span className="block text-[11px] mt-0.5" style={{ color: C.slateMute }}>{a.time}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
