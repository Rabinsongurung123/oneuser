"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C } from "@/components/ui-lib/theme";
import Card from "@/components/ui-lib/Card";
import { useToast } from "@/components/ui-lib/Toast";
import { useAuth } from "@/components/ui-lib/AuthContext";

const ROLE_HOMES = {
  ADMIN: "/admin/dashboard",
  LIBRARIAN: "/librarian/dashboard",
  MEMBER: "/member/home",
};

const inputStyle = (error) => ({
  background: C.paper,
  border: `1px solid ${error ? C.stamp : C.paperLine}`,
  color: C.slate,
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const showToast = useToast();
  const [mode, setMode] = useState("login");

  // Show a confirmation when the user arrives here right after signing out.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("signedOut=1")) {
      showToast("Signed out", "sage");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast]);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setNote("");
    setErrors((prev) => ({ ...prev, [field]: undefined, match: undefined }));
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setNote("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (mode === "register") {
      if (!form.name.trim()) found.name = "Name is required";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Enter a valid email address";
      if (form.password.length < 8) found.password = "Password must be at least 8 characters";
      if (form.password !== form.confirm) found.match = "Passwords do not match";
    } else {
      if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Enter a valid email address";
      if (!form.password) found.password = "Password is required";
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    if (mode === "register") {
      setNote("Account creation is available in a future update — log in with an existing account for now.");
      return;
    }

    setBusy(true);
    setErrors({});
    setNote("");
    try {
      const user = await login(form.email, form.password);
      const home = ROLE_HOMES[user.role];
      if (home) {
        router.push(`${home}?welcome=1`);
      } else {
        setNote(`Signed in as ${user.name} — but role ${user.role} has no portal yet.`);
      }
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
          {mode === "login" ? "Welcome back" : "Join Fernbridge"}
        </h1>
        <p className="f-body text-[13.5px] mt-1" style={{ color: C.slateMute }}>
          {mode === "login"
            ? "Log in to manage your loans, reservations, and more."
            : "Create an account to borrow, reserve, and track your reading."}
        </p>
      </div>

      <Card>
        {/* Mode toggle */}
        <div className="flex mb-5 p-1 rounded-md" style={{ background: C.paper, border: `1px solid ${C.paperLine}` }}>
          {["login", "register"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className="flex-1 px-4 py-2 rounded f-body text-[13px] font-medium cursor-pointer transition-colors"
              style={
                mode === m
                  ? { background: C.ink, color: C.paper }
                  : { background: "transparent", color: C.slateMute }
              }
            >
              {m === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              {label("Name")}
              <input
                value={form.name}
                onChange={setField("name")}
                className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
                style={inputStyle(errors.name)}
              />
              {errorText("name")}
            </div>
          )}
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
          {mode === "register" && (
            <div>
              {label("Confirm password")}
              <input
                type="password"
                value={form.confirm}
                onChange={setField("confirm")}
                className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
                style={inputStyle(errors.match)}
              />
              {errorText("match")}
            </div>
          )}

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
            {busy ? "Signing in…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {note && (
          <p className="f-body text-[12.5px] mt-4 text-center" style={{ color: C.brass }}>
            {note}
          </p>
        )}
      </Card>

      <p className="f-body text-[12.5px] mt-5 text-center" style={{ color: C.slateMute }}>
        Just browsing?{" "}
        <Link href="/guest/catalog" className="no-underline font-medium" style={{ color: C.sage }}>
          Explore the catalog
        </Link>{" "}
        without an account.
      </p>
    </div>
  );
}
