"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, getStoredToken, storeToken, clearStoredToken, getStoredRefreshToken, storeRefreshToken, clearStoredRefreshToken } from "@/lib/api";

const AuthContext = createContext(null);

const AUTH_KEY = "fb_auth_user";
const AUTH_COOKIE = "fb_auth";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function setAuthCookie(token) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=604800; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // restore the session after hydration to avoid a mismatch
  useEffect(() => {
    const t = setTimeout(() => {
      const storedUser = readStoredUser();
      const storedToken = getStoredToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
        setAuthCookie(storedToken);
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const login = async (email, password) => {
    const json = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const { accessToken, refreshToken, user: loggedInUser } = json.data;
    setToken(accessToken);
    setUser(loggedInUser);
    storeToken(accessToken);
    if (refreshToken) storeRefreshToken(refreshToken);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(loggedInUser));
    }
    setAuthCookie(accessToken);
    return loggedInUser;
  };

  const logout = async () => {
    // revoke server-side, but always clear locally even if that call fails
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await api("/auth/logout", { method: "POST", body: { refreshToken } });
      } catch { /* best-effort — local cleanup still runs */ }
    }
    setUser(null);
    setToken(null);
    clearStoredToken();
    clearStoredRefreshToken();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
    }
    clearAuthCookie();
  };

  return (
    <AuthContext.Provider value={{ user, token, hydrated, login, logout, initials: initialsOf(user?.name) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
