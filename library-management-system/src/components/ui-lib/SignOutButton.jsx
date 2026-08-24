"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { C } from "./theme";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "./AuthContext";

export default function SignOutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const signOut = async () => {
    setConfirmOpen(false);
    try {
      await logout();
    } finally {
      router.push("/guest/login?signedOut=1");
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-80"
        style={{ background: C.paper, border: `1px solid ${C.stamp}`, color: C.stamp }}
      >
        <LogOut size={14} /> Sign out
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={signOut}
        title="Sign out?"
        message="Your session will be ended and you'll be returned to the login page."
        confirmLabel="Sign Out"
        danger
      />
    </>
  );
}
