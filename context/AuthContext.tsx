// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api"; // if you don't use path alias, change to "../lib/api" or appropriate relative path
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
    // try to load user on mount if token present
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const resp = await api.get("/api/auth/me");
        setUser(resp.data.user || null);
      } catch (err) {
        console.warn("Auth: could not fetch /me", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post("/api/auth/login", { email, password });
      const { token, user: userResp } = resp.data;
      if (!token) return { ok: false, error: "No token returned from server" };
      localStorage.setItem("token", token);
      setUser(userResp || null);
      return { ok: true };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      return { ok: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
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
