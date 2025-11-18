// app/login/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed

export default function LoginPage() {
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
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-md p-6 rounded shadow bg-white">
        <h2 className="text-2xl mb-4">Admin Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input className="mt-1 block w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input className="mt-1 block w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={busy} className="w-full p-2 bg-blue-600 text-white rounded">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
