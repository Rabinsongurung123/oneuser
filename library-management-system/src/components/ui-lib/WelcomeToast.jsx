"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui-lib/Toast";
import { useAuth } from "@/components/ui-lib/AuthContext";

// Shows a "Signed in" toast after login and strips the ?welcome=1 param.
export default function WelcomeToast() {
  const { user } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("welcome=1")) {
      const first = user?.name?.trim().split(/\s+/)[0];
      showToast(first ? `Signed in — welcome back, ${first}!` : "Signed in");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast, user]);

  return null;
}
