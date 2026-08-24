const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "fb_auth_token";
const REFRESH_KEY = "fb_auth_refresh";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function storeRefreshToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_KEY, token);
}

export function clearStoredRefreshToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!res.ok) {
      // dead session — clear local auth so the next request lands on login
      if (res.status === 401 || res.status === 403) {
        clearStoredToken();
        clearStoredRefreshToken();
        if (typeof document !== "undefined") {
          document.cookie = "fb_auth=; path=/; max-age=0";
        }
      }
      return false;
    }
    if (!json?.data?.accessToken) return false;
    storeToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// fetch wrapper: bearer token, one silent retry after a 401 refresh
export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const authToken = token || getStoredToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — is the backend server running?");
  }

  // Access token expired: try to refresh once and retry.
  if (res.status === 401 && !token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getStoredToken()}`;
      try {
        res = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch {
        throw new Error("Network error — is the backend server running?");
      }
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no JSON body (e.g. 204 or non-JSON error)
  }

  if (!res.ok) {
    const message =
      json?.error?.message ||
      json?.message ||
      (json?.error && typeof json.error === "string" ? json.error : null) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return json;
}

export default api;
