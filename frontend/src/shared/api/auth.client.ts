"use client";

import { API_URL } from "./base";

function getTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  };
}

function setTokens(access?: string | null, refresh?: string | null) {
  if (typeof window === "undefined") return;
  if (access) localStorage.setItem("access_token", access);
  else localStorage.removeItem("access_token");

  if (refresh) localStorage.setItem("refresh_token", refresh);
  else localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(refresh: string) {
  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Failed to refresh token");

  setTokens(data.access, data.refresh || refresh);
  return data.access;
}

export async function apiFetchAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let { access, refresh } = getTokens();

  if (!access) throw new Error("No access token, user must login");

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && refresh) {
    try {
      access = await refreshAccessToken(refresh);
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
    } catch {
      setTokens(null, null);
      throw new Error("Refresh token invalid, please login again");
    }
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}
