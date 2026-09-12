import { fontStyles, C } from "@/components/ui-lib/theme";
import PublicNavBar from "@/components/ui-lib/PublicNavBar";
import { ToastProvider } from "@/components/ui-lib/Toast";
import { branches } from "@/lib/mock-data";

export default function GuestLayout({ children }) {
  return (
    <ToastProvider>
    <div className="w-full min-h-screen flex flex-col f-body" style={{ background: C.paper }}>
      <style>{fontStyles}</style>
      <PublicNavBar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>
      <footer className="w-full" style={{ background: C.ink }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="f-display text-[18px]" style={{ color: C.paper }}>Fernbridge</p>
            <p className="f-body text-[12.5px] mt-1" style={{ color: "rgba(246,243,236,0.7)" }}>
              Browse, borrow, and explore — free for everyone in the community.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p
              className="f-body text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "rgba(246,243,236,0.55)" }}
            >
              Hours this week
            </p>
            {branches.slice(0, 2).map((b) => (
              <p key={b.name} className="f-body text-[12.5px]" style={{ color: C.paper }}>
                {b.name} · {b.hours}
              </p>
            ))}
          </div>
        </div>
      </footer>
    </div>
    </ToastProvider>
  );
}
