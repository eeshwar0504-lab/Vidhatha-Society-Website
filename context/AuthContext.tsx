// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "@/lib/api"; // if you don't use path alias, change to "../lib/api" or appropriate relative path
import { useRouter } from "next/navigation";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // try to load user on mount if token present OR try /me in cookie-based flow
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          // set header for subsequent requests
          setAuthToken(token);
        }

        // Always attempt /api/auth/me on init:
        // - If JWT: /me will return user (token added above)
        // - If cookie auth: cookie will be sent (see note below about withCredentials)
        try {
          const resp = await api.get("/api/auth/me");
          setUser(resp?.data?.user || null);
        } catch (err) {
          // if /me fails, clear token to avoid stuck state
          console.warn("Auth: /me failed on init", err);
          localStorage.removeItem("token");
          setAuthToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error("Auth init error:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post("/api/auth/login", { email, password });
      const data = resp?.data || {};

      // If backend returned a token (JWT flow)
      if (data.token) {
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
        // If backend also returned user, use it; otherwise fetch /me
        if (data.user) {
          setUser(data.user);
          return { ok: true };
        }
        // fetch /me to get user details
        try {
          const me = await api.get("/api/auth/me");
          setUser(me?.data?.user || null);
          return { ok: true };
        } catch (e) {
          console.warn("login: /me failed after token login", e);
          return { ok: true }; // still consider login success - token stored
        }
      }

      // If backend did not return token, it might have created a server-side cookie session.
      // Try to fetch /me; if it returns a user — success. If not, return error.
      try {
        const me = await api.get("/api/auth/me");
        if (me?.data?.user) {
          // No token in localStorage, but server session exists (cookie-based)
          setUser(me.data.user);
          return { ok: true };
        }
      } catch (meErr) {
        // /me failed — maybe server returns user inside login response under different key
        if (data.user) {
          setUser(data.user);
          return { ok: true };
        }

        // fallback: treat login as failure
        console.warn("login: no token and /me failed", meErr);
        const message = data?.message || data?.error || "No token returned from server and /me failed";
        return { ok: false, error: message };
      }

      // If we reach here but data.user existed we already returned above.
      // Safety fallback:
      if (data.user) {
        setUser(data.user);
        return { ok: true };
      }

      return { ok: false, error: "Login failed: unexpected server response" };
    } catch (error: any) {
      console.error("login failed:", error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error.message || "Login failed";
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      // call backend logout endpoint if present (clears server cookie/session)
      try {
        await api.post("/api/auth/logout");
      } catch (e) {
        // ignore - not all backends expose logout route
      }
    } finally {
      localStorage.removeItem("token");
      setAuthToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
