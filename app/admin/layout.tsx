"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ToastProvider from "@/components/ToastProvider";

/**
 * Admin layout (app/admin/layout.tsx)
 * - Adjusted spacing so main content sits right next to the fixed sidebar
 * - Uses `md:ml-72` (margin-left) instead of `md:pl-72` to avoid extra centered gap
 * - Keeps the polished UI effects for sidebar and header
 */

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname() || "/admin/dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", href: "/" }];

    let accum = "";
    parts.forEach((part) => {
      accum += `/${part}`;
      let label = part;
      if (part === "admin") label = "Admin";
      if (part === "dashboard") label = "Dashboard";
      if (part === "programs") label = "Programs";
      if (part === "create") label = "Create";
      if (part === "edit") label = "Edit";
      crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: accum });
    });

    return crumbs;
  }, [pathname]);

  // Sidebar width used in CSS: w-72 (18rem). We use md:ml-72 on main content to offset it.
  const navLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { label: "Programs", href: "/admin/programs", icon: "folder" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Payments", href: "/admin/payments", icon: "payments" },
    { label: "Settings", href: "/admin/settings", icon: "settings" },
  ];

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === "/admin" || pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/")
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transition-transform duration-300 ease-in-out transform
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:block`}
          aria-label="Admin sidebar"
        >
          <div className="h-full flex flex-col">
            {/* Branding / top */}
            <div className="px-6 py-5 border-b flex items-center justify-between gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold shadow-sm transform transition-transform group-hover:scale-105">
                  V
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-tight">Vidhatha</div>
                  <div className="text-xs text-gray-500">Admin Panel</div>
                </div>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="md:hidden p-1 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-4 py-4 flex-1 overflow-auto">
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition duration-200
                        ${active ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg scale-100" : "text-gray-700 hover:shadow-sm hover:translate-x-0.5"}
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      {/* icon wrapper */}
                      <span
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-md flex-shrink-0 transition
                          ${active ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}
                        `}
                        aria-hidden="true"
                      >
                        {link.icon === "dashboard" && (
                          <svg className={`w-4 h-4 ${active ? "text-white" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 13h4V7H3v6zM3 17h4v-2H3v2zM7 13h10V3H7v10zM7 17h10v-2H7v2z" />
                          </svg>
                        )}
                        {link.icon === "folder" && (
                          <svg className={`w-4 h-4 ${active ? "text-white" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                        )}
                        {link.icon === "users" && (
                          <svg className={`w-4 h-4 ${active ? "text-white" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 14a6 6 0 0112 0v1H4v-1z" />
                          </svg>
                        )}
                        {link.icon === "payments" && (
                          <svg className={`w-4 h-4 ${active ? "text-white" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2H2V6zM2 10h16v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                        )}
                        {link.icon === "settings" && (
                          <svg className={`w-4 h-4 ${active ? "text-white" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11.3 1.046a1 1 0 00-2.6 0l-.214.6a7.01 7.01 0 00-1.517.55l-.545-.298a1 1 0 00-1.354.45L3.2 4.87a1 1 0 00.45 1.354l.545.298c-.09.324-.156.657-.198 1l-.6.214a1 1 0 000 1.999l.6.214c.042.343.108.676.198 1l-.545.298a1 1 0 00-.45 1.354l1.02 2.262a1 1 0 001.354.45l.545-.298c.468.253.98.452 1.517.55l.214.6a1 1 0 002.6 0l.214-.6c.537-.098 1.049-.297 1.517-.55l.545.298a1 1 0 001.354-.45l1.02-2.262a1 1 0 00-.45-1.354l-.545-.298c.09-.324.156-.657.198-1l.6-.214a1 1 0 000-1.999l-.6-.214c-.042-.343-.108-.676-.198-1l.545-.298a1 1 0 00.45-1.354L15.6 1.598a1 1 0 00-1.354-.45l-.545.298a7.01 7.01 0 00-1.517-.55L11.3 1.046z" />
                          </svg>
                        )}
                      </span>

                      <span className="truncate">{link.label}</span>

                      {/* animated active badge */}
                      {active && (
                        <span className="ml-auto flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                          <svg className="w-3 h-3 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M7.629 13.07l7.071-7.07 1.414 1.415-8.485 8.486L4.243 11.95l1.414-1.415 1.972 1.972z" />
                          </svg>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* profile & actions */}
            <div className="px-4 py-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-gray-500">admin@vidhatha.org</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link href="/" className="text-xs text-indigo-600 hover:underline">View site</Link>
                <button className="ml-auto text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-100 transition">Sign out</button>
              </div>
            </div>
          </div>
        </aside>

        {/* mobile backdrop when sidebar open */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-30 md:hidden bg-black/40"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area
            IMPORTANT change: use md:ml-72 (margin-left) instead of md:pl-72.
            This shifts the whole content container to the right of the fixed sidebar
            while keeping internal centering (max-w-7xl) intact — avoids the large empty gap.
         */}
        <div className="flex-1 md:ml-72">
          <header className="sticky top-0 z-20 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md border hover:bg-gray-50 transition"
                    aria-label="Toggle sidebar"
                  >
                    <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="text-sm font-semibold tracking-wide">Admin Dashboard</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <input
                      type="search"
                      placeholder="Search admin..."
                      className="border rounded px-3 py-1 text-sm w-64 focus:ring-2 focus:ring-indigo-100 outline-none"
                      aria-label="Admin search"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href="/" className="text-sm text-indigo-600 hover:underline">Visit site</Link>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition" title="Notifications" aria-label="Notifications">
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 000 2v1l-1 1v1h12v-1l-1-1V9a1 1 0 000-2h-1V6a4 4 0 00-4-4zM7 16a3 3 0 006 0H7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-600">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  {breadcrumbs.map((c, i) => (
                    <li key={c.href} className="flex items-center gap-2">
                      <Link href={c.href} className="hover:underline text-sm text-gray-600">{c.label}</Link>
                      {i < breadcrumbs.length - 1 && (
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M7.05 4.55L11.5 9l-4.45 4.45 1.414 1.414L13.328 9.999 8.464 5.136 7.05 6.55z" />
                        </svg>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow-sm p-6 min-h-[60vh] transition-all duration-200">
              {children}
            </div>
          </main>
        </div>

        {/* Toasts */}
        <ToastProvider />
      </div>
    </ProtectedRoute>
  );
}
