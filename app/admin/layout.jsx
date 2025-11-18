"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!user) return null; // while redirecting

  return <>{children}</>;
}

function AdminShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-700">Vidhatha Admin</h2>
          <p className="text-sm text-gray-600 mt-1">
            {user?.name || user?.email}
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className={`p-2 rounded ${
              pathname === "/admin"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/programs"
            className={`p-2 rounded ${
              pathname.startsWith("/admin/programs")
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            Programs
          </Link>

          <Link
            href="/admin/programs/create"
            className={`p-2 rounded ${
              pathname === "/admin/programs/create"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            + Create Program
          </Link>
        </nav>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-left border rounded text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Vidhatha Admin</h1>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={() => router.push("/admin/programs")}
            >
              Programs
            </button>
            <button
              onClick={logout}
              className="px-2 py-1 border rounded text-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayoutWrapper({ children }) {
  return (
    <AuthProvider>
      <Protected>
        <AdminShell>{children}</AdminShell>
      </Protected>
    </AuthProvider>
  );
}
