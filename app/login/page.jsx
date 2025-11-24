// app/login/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "../../context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err) {
      setError(err?.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-[#F9FAFB] via-[#FFFDF7] to-[#FFF7D6]">
      <div className="w-full max-w-md">
        {/* Small breadcrumb / back link */}
        <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-[#1D3A8A] transition"
          >
            <span className="text-sm">←</span>
            <span>Back to website</span>
          </Link>
          <span className="uppercase tracking-[0.24em] font-semibold text-gray-400">
            Admin
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/95 border border-yellow-100 rounded-3xl shadow-xl shadow-yellow-100/70 px-6 py-7 md:px-7 md:py-8">
          <div className="mb-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#D62828] mb-2">
              Admin Login
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, Team Vidhatha 
            </h1>
            <p className="mt-1 text-xs md:text-sm text-gray-600">
              Sign in to manage programs, events, and website content.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-xs md:text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                Email
              </label>
              <input
                className="mt-0 block w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                Password
              </label>
              <input
                className="mt-0 block w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Only authorized Vidhatha Society admins can sign in here.
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="
                w-full mt-2 inline-flex items-center justify-center
                rounded-full px-4 py-2.5 text-sm font-semibold
                text-white bg-gradient-to-r from-[#F2C411] to-[#D62828]
                shadow-md shadow-[#D62828]/40
                hover:brightness-105 hover:-translate-y-0.5
                active:translate-y-0
                transition disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Tiny footer note */}
          <p className="mt-5 text-[11px] text-center text-gray-400">
            If you’re not part of the admin team, please return to the{" "}
            <Link href="/" className="underline hover:text-[#1D3A8A]">
              main site
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      {/* top letterhead stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F2C411] via-[#D62828] to-[#1D3A8A]" />
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </>
  );
}
