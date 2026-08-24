"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui-lib/Sidebar";
import TopBar from "@/components/ui-lib/TopBar";
import { fontStyles, C } from "@/components/ui-lib/theme";
import { ToastProvider } from "@/components/ui-lib/Toast";
import { LoansProvider } from "@/components/ui-lib/LoansContext";
import { ReservationsProvider } from "@/components/ui-lib/ReservationsContext";
import { FinesProvider } from "@/components/ui-lib/FinesContext";
import { useAuth } from "@/components/ui-lib/AuthContext";
import { NAV } from "./nav";

export default function MemberLayout({ children }) {
  const pathname = usePathname();
  const { user, initials } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  // e.g. /member/catalog -> catalog ; /member -> home
  const active = segments[1] || "home";
  const activeNav = NAV.find((n) => n.key === active);

  return (
    <ToastProvider>
      <LoansProvider>
        <ReservationsProvider>
          <FinesProvider>
          <div className="w-full min-h-screen flex f-body" style={{ background: C.paper }}>
            <style>{fontStyles}</style>
            <Sidebar
              navItems={NAV}
              basePath="member"
              active={active}
              appName="Fernbridge"
              appSubtitle="Member Portal"
            />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar
                subtitle="Member"
                title={activeNav ? activeNav.label : "Home"}
                userLabel={user?.name || "Member"}
                userInitials={initials || "ME"}
              />
              <main className="flex-1 overflow-y-auto px-8 py-6">
                {children}
              </main>
            </div>
          </div>
          </FinesProvider>
        </ReservationsProvider>
      </LoansProvider>
    </ToastProvider>
  );
}
