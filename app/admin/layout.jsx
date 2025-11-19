"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Admin layout
 * Path: /app/admin/layout.jsx
 *
 * Features:
 * - Collapsible sidebar (mobile-friendly)
 * - Topbar with quick actions
 * - Breadcrumbs (built from pathname)
 * - Content wrapper with consistent padding/width
 * - Slot for toast provider (if present)
 *
 * Usage:
 * Place this file at /app/admin/layout.jsx so it wraps all admin pages.
 */

export default function AdminLayout({ children }) {
  const pathname = usePathname() || "/admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // build breadcrumbs from the pathname
  const breadcrumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", href: "/" }];

    let accum = "";
    parts.forEach((part, idx) => {
      accum += `/${part}`;
      // nicer label for common admin routes
      let label = part;
      if (part === "admin") label = "Admin";
      if (part === "programs") label = "Programs";
      if (part === "create") label = "Create";
      if (part === "edit") label = "Edit";
      crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: accum });
    });

    return crumbs;
  }, [pathname]);

  const navLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "Programs", href: "/admin/programs" },
    { label: "Users", href: "/admin/users" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Settings", href: "/admin/settings" },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/") || (href === "/admin" && pathname === "/admin");

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transition-transform duration-200 ease-in-out transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static md:block`}
          aria-label="Admin sidebar"
        >
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">V</div>
                <div>
                  <div className="text-lg font-semibold">Vidhatha</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
              </Link>
            </div>

            <nav className="px-2 py-4 flex-1 overflow-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md mb-1 text-sm ${
                    isActive(link.href) ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-4 py-3 border-t text-sm">
              <div className="mb-2">Signed in as</div>
              <div className="font-medium">Admin User</div>
              <div className="mt-3">
                <Link href="/" className="text-xs text-blue-600 hover:underline">View site</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay when sidebar is open on mobile */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-30 md:hidden bg-black/40"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 md:pl-64">
          {/* Topbar */}
          <header className="sticky top-0 z-20 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md border"
                    aria-label="Toggle sidebar"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="text-sm font-medium">Admin Dashboard</div>
                </div>

                <div className="flex items-center gap-3">
                  {/* placeholder for search or quick actions */}
                  <div className="hidden sm:block">
                    <input
                      type="search"
                      placeholder="Search admin..."
                      className="border rounded px-3 py-1 text-sm"
                      aria-label="Admin search"
                    />
                  </div>

                  <div>
                    <Link href="/" className="text-sm text-blue-600 hover:underline">Visit site</Link>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-600">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  {breadcrumbs.map((c, i) => (
                    <li key={c.href} className="flex items-center gap-2">
                      <Link href={c.href} className="hover:underline text-sm">{c.label}</Link>
                      {i < breadcrumbs.length - 1 && <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M7.05 4.55L11.5 9 7.05 13.45 8.464 14.864 13.328 9.999 8.464 5.136 7.05 6.55z" /></svg>}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          {/* Page wrapper with consistent max width and padding */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow-sm p-6 min-h-[60vh]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
