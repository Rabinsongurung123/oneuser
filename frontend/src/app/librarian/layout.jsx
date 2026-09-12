"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui-lib/Sidebar";
import TopBar from "@/components/ui-lib/TopBar";
import { fontStyles, C } from "@/components/ui-lib/theme";
import { ToastProvider } from "@/components/ui-lib/Toast";
import { LoansProvider } from "@/components/ui-lib/LoansContext";
import { useAuth } from "@/components/ui-lib/AuthContext";
import { NAV } from "./nav";

export default function LibrarianLayout({ children }) {
  const pathname = usePathname();
  const { user, initials } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  // e.g. /librarian/users -> users ; /librarian -> dashboard
  const active = segments[1] || "dashboard";
  const activeNav = NAV.find((n) => n.key === active);

  return (
    <ToastProvider>
      <LoansProvider>
        <div className="w-full min-h-screen flex f-body" style={{ background: C.paper }}>
          <style>{fontStyles}</style>
          <Sidebar
            navItems={NAV}
            basePath="librarian"
            active={active}
            appName="Fernbridge"
            appSubtitle="Librarian Console"
          />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar subtitle="Librarian" title={activeNav ? activeNav.label : "Dashboard"} userLabel={user?.name || "Librarian"} userInitials={initials || "LI"} />
            <main className="flex-1 overflow-y-auto px-8 py-6">
              {children}
            </main>
          </div>
        </div>
      </LoansProvider>
    </ToastProvider>
  );
}

