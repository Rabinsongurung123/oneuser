"use client";

import { BookOpen, Clock, BookMarked, CircleDollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import Badge from "@/components/ui-lib/Badge";
import DueStamp from "@/components/ui-lib/DueStamp";
import DemoBanner from "@/components/ui-lib/DemoBanner";
import SignOutButton from "@/components/ui-lib/SignOutButton";
import WelcomeToast from "@/components/ui-lib/WelcomeToast";
import { useLoans } from "@/components/ui-lib/LoansContext";
import { useReservations } from "@/components/ui-lib/ReservationsContext";
import { useFines } from "@/components/ui-lib/FinesContext";
import { useAuth } from "@/components/ui-lib/AuthContext";
import { useApiData } from "@/components/ui-lib/useApiData";
import { getCurrentLoan } from "@/lib/backend";

const addDays = (d, n) => new Date(d.getTime() + n * 86400000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

const axisTick = { fontSize: 12, fill: C.slateMute };

const statAccents = {
  sage: { chip: C.sageSoft, fg: C.sage, bar: C.sage },
  brass: { chip: C.brassSoft, fg: C.brass, bar: C.brass },
  stamp: { chip: C.stampSoft, fg: C.stamp, bar: C.stamp },
};

function MemberStat({ label, value, icon: Icon, accent = "sage" }) {
  const a = statAccents[accent] || statAccents.sage;
  return (
    <div
      className="group rounded-md p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: C.paperCard, border: `1px solid ${C.paperLine}` }}
    >
      <div className="flex items-start justify-between">
        <span className="f-body text-[11px] uppercase tracking-[0.08em]" style={{ color: C.slateMute }}>
          {label}
        </span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: a.chip, color: a.fg }}
        >
          <Icon size={15} />
        </span>
      </div>
      <div className="f-display text-[26px] leading-none mt-2" style={{ color: C.ink }}>{value}</div>
      <div
        className="h-[3px] w-0 group-hover:w-full rounded-full mt-3 transition-all duration-300"
        style={{ background: a.bar, opacity: 0.85 }}
      />
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="f-body text-[12px] px-2.5 py-1.5 rounded-md shadow-lg" style={{ background: C.ink, color: C.paper }}>
      {label != null && (
        <div className="text-[10.5px] uppercase tracking-wide mb-0.5" style={{ color: C.paper, opacity: 0.7 }}>
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill || C.sage }} />
          <span>{p.name}:</span>
          <span className="f-mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { loans, source: loansSource } = useLoans();
  const { reservations, source: resvSource } = useReservations();
  const { fines, source: finesSource } = useFines();

  // Live "currently borrowed" from the dedicated endpoint
  const userId = user?.id || user?.userId;
  const { data: currentLoan } = useApiData(
    () => userId ? getCurrentLoan(userId) : Promise.resolve(null),
    null,
    [userId]
  );

  const allApi = loansSource === "api" && resvSource === "api" && finesSource === "api";
  const anyLoading =
    loansSource === "loading" || resvSource === "loading" || finesSource === "loading";
  const showDemo = !allApi && !anyLoading;

  const myLoans = loans || [];
  const activeLoans = myLoans.filter((l) => l.status !== "Returned");
  const onTime = myLoans.filter((l) => l.status === "On time").length;
  const dueSoon = myLoans.filter((l) => {
    if (l.status !== "On time") return false;
    return l.due <= addDays(new Date(), 3) && new Date(l.due) >= new Date(today());
  });
  const myReservations = reservations || [];
  const reservedReady = myReservations.filter((r) => r.status === "Ready for pickup");
  const myUnpaidFines = (fines || []).filter((f) => f.status === "Unpaid");
  const finesOwed = myUnpaidFines.reduce((s, f) => s + f.amount, 0);

  const firstName = user?.name?.split(" ")[0] || "Member";

  // Upcoming returns — one bar per day for the next 7 days.
  const upcomingReturns = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(new Date(), i);
    return { m: day.slice(5), count: myLoans.filter((l) => l.due === day).length };
  });

  const statusCount = (s) => myLoans.filter((l) => l.status === s).length;
  const loanStatusSplit = [
    { name: "On time", value: statusCount("On time") },
    { name: "Overdue", value: statusCount("Overdue") },
    { name: "Returned", value: statusCount("Returned") },
  ].filter((d) => d.value > 0);
  const statusColors = { "On time": C.sage, Overdue: C.stamp, Returned: C.ink };

  const attention = [
    ...reservedReady.map((r) => ({ kind: "ready", title: r.title, detail: "Ready for pickup" })),
    ...myUnpaidFines.map((f) => ({ kind: "fine", title: f.reason, detail: `$${f.amount.toFixed(2)} unpaid` })),
  ];

  return (
    <>
      <PageHeader title="Home" subtitle={`Welcome back, ${firstName}.`} action={<SignOutButton />} />
      <WelcomeToast />
      {showDemo && <DemoBanner />}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MemberStat label="Active Loans" value={activeLoans.length} icon={BookOpen} accent="sage" />
        <MemberStat label="Due Soon" value={dueSoon.length} icon={Clock} accent="brass" />
        <MemberStat label="Reservations Ready" value={reservedReady.length} icon={BookMarked} accent="sage" />
        <MemberStat label="Fines Owed" value={`$${finesOwed.toFixed(2)}`} icon={CircleDollarSign} accent="stamp" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card title="Upcoming Returns" className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="f-body text-[12px]" style={{ color: C.slateMute }}>
              Titles due back in the next 7 days
            </p>
            <span className="f-mono text-[12px]" style={{ color: C.sage }}>
              {dueSoon.length} due soon
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={upcomingReturns} barCategoryGap="28%">
              <CartesianGrid stroke={C.paperLine} vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="m" tick={axisTick} axisLine={{ stroke: C.paperLine }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<ChartTip />} cursor={{ fill: C.paper, opacity: 0.6 }} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={38}>
                {upcomingReturns.map((d, i) => (
                  <Cell key={i} fill={d.count > 0 ? C.sage : C.paperLine} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Loan Status">
          {loanStatusSplit.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="f-body text-[12.5px]" style={{ color: C.slateMute }}>No loans yet.</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={loanStatusSplit}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {loanStatusSplit.map((d) => <Cell key={d.name} fill={statusColors[d.name] || C.slateMute} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="f-display text-[30px] leading-none" style={{ color: C.ink }}>{myLoans.length}</span>
                  <span className="f-body text-[10.5px] uppercase tracking-[0.08em] mt-1" style={{ color: C.slateMute }}>
                    Total loans
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {loanStatusSplit.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 f-body text-[12px]" style={{ color: C.slateMute }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: statusColors[d.name] || C.slateMute }} />
                    {d.name}
                    <span className="f-mono" style={{ color: C.slate }}>{d.value}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Currently Borrowed" className="col-span-2">
          {activeLoans.length === 0 && !currentLoan ? (
            <p className="f-body text-[13px]" style={{ color: C.slateMute }}>You have no active loans.</p>
          ) : (
            <>
              {/* Live current loan from GET /borrow/student/:id/current */}
              {currentLoan && (
                <div
                  className="flex items-center justify-between px-3 py-2.5 -mx-3 mb-1 rounded-md"
                  style={{ background: C.sageSoft }}
                >
                  <div>
                    <p className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{currentLoan.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <DueStamp date={currentLoan.due} overdue={currentLoan.status === "Overdue"} />
                      <Badge tone="sage">Currently borrowed</Badge>
                    </div>
                  </div>
                  <p className="f-mono text-[12px]" style={{ color: C.slateMute }}>Due {currentLoan.due}</p>
                </div>
              )}
              <div className="space-y-1">
                {activeLoans
                  .filter((l) => !currentLoan || l.id !== currentLoan.id)
                  .map((l, i) => (
                    <div
                      key={l.id || i}
                      className="flex items-center justify-between px-3 py-2.5 -mx-3 rounded-md transition-colors duration-150 hover:bg-[#F6F3EC]"
                    >
                      <div>
                        <p className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>{l.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <DueStamp date={l.due} overdue={l.status === "Overdue"} />
                          <Badge tone={l.status === "Overdue" ? "stamp" : "sage"}>{l.status}</Badge>
                        </div>
                      </div>
                      <p className="f-mono text-[12px]" style={{ color: C.slateMute }}>Due {l.due}</p>
                    </div>
                  ))}
              </div>
              <div
                className="flex items-center justify-between px-3 py-2.5 -mx-3 mt-2 rounded-md"
                style={{ background: C.paper }}
              >
                <span className="f-body text-[12px]" style={{ color: C.slateMute }}>
                  {activeLoans.length} {activeLoans.length === 1 ? "title" : "titles"} on loan
                </span>
                <span className="f-body text-[12px] font-medium" style={{ color: C.sage }}>
                  {onTime} on time
                </span>
              </div>
            </>
          )}
        </Card>

        <Card title="Needs Attention">
          {attention.length === 0 ? (
            <p className="f-body text-[12.5px]" style={{ color: C.slateMute }}>Nothing needs your attention.</p>
          ) : (
            <div className="space-y-1">
              {attention.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2 -mx-3 rounded-md transition-colors duration-150 hover:bg-[#F6F3EC]"
                >
                  <span
                    className="w-1 self-stretch rounded-full mt-0.5"
                    style={{ background: a.kind === "fine" ? C.stamp : C.sage }}
                  />
                  <div>
                    <p className="f-body text-[12.5px] leading-snug font-medium" style={{ color: C.slate }}>{a.title}</p>
                    <p className="f-body text-[11px] mt-0.5" style={{ color: C.slateMute }}>{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
