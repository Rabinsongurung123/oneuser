"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/components/ui-lib/theme";
import Card from "@/components/ui-lib/Card";
import { ToastProvider, useToast } from "@/components/ui-lib/Toast";
import { useAuth } from "@/components/ui-lib/AuthContext";

const inputStyle = (error) => ({
  background: C.paper,
  border: `1px solid ${error ? C.stamp : C.paperLine}`,
  color: C.slate,
});

function LoginPageInner() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const showToast = useToast();
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Show a confirmation when arriving here right after signing out.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("signedOut=1")) {
      showToast("Signed out", "sage");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast]);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Enter a valid email address";
    if (!form.password) found.password = "Password is required";
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setBusy(true);
    setErrors({});
    try {
      const loggedIn = await login(form.email, form.password);
      if (loggedIn.role !== "ADMIN") {
        // Single-admin app: sign the non-admin straight back out and explain why.
        setErrors({
          form: `Access restricted — ${loggedIn.name || "this account"} is signed in as ${loggedIn.role}. Only the admin can use this console.`,
        });
        try {
          await logout();
        } catch {
          // best effort — the session must not survive a rejected login
        }
        return;
      }
      router.push("/admin/dashboard?welcome=1");
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  };

  const label = (text) => (
    <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>
      {text}
    </label>
  );

  const errorText = (key) =>
    errors[key] && <p className="f-body text-[11.5px] mt-1" style={{ color: C.stamp }}>{errors[key]}</p>;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="f-display text-[26px]" style={{ color: C.ink }}>
          Admin sign in
        </h1>
        <p className="f-body text-[13.5px] mt-1" style={{ color: C.slateMute }}>
          Manage the catalog, circulation, fines, and settings from one console.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {label("Email")}
            <input
              type="email"
              value={form.email}
              onChange={setField("email")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={inputStyle(errors.email)}
            />
            {errorText("email")}
          </div>
          <div>
            {label("Password")}
            <input
              type="password"
              value={form.password}
              onChange={setField("password")}
              className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
              style={inputStyle(errors.password)}
            />
            {errorText("password")}
          </div>

          {errors.form && (
            <p className="f-body text-[12.5px] px-3 py-2 rounded-md" style={{ background: C.stampSoft, color: C.stamp }}>
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-md f-body text-[13.5px] font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: C.ink, color: C.paper }}
          >
            {busy ? "Signing in…" : "Log In"}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginPageInner />
    </ToastProvider>
  );
}
