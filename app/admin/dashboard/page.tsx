// app/admin/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const stats = {
    programs: 24,
    donations: 128,
    volunteers: 36,
    pendingApprovals: 3,
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-[80vh] p-6 md:p-10 bg-gradient-to-b from-white to-[#FFFBF5]">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-[#F2C411] to-[#D62828] shadow-md flex items-center justify-center text-white text-lg font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome,{" "}
                <span className="font-medium text-gray-800">
                  {user?.name || user?.email || "Admin"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 10.5L12 4l9 6.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M5 21V11h14v10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            View site
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#F2C411] to-[#D62828] text-white shadow-md hover:brightness-105 hover:-translate-y-0.5 transform transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs text-gray-500">Programs</h3>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">
                {stats.programs}
              </div>
            </div>
            <div className="bg-[#E9F5EE] p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-[#2E7D32]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 9h14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Manage all programs.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs text-gray-500">Donations</h3>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">
                {stats.donations}
              </div>
            </div>
            <div className="bg-[#FFF3E0] p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-[#F57C00]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 8v8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Track donations.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs text-gray-500">Volunteers</h3>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">
                {stats.volunteers}
              </div>
            </div>
            <div className="bg-[#E8F0FF] p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-[#1D4ED8]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M4 20c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Volunteer overview.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs text-gray-500">Pending</h3>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">
                {stats.pendingApprovals}
              </div>
            </div>
            <div className="bg-[#FFF4F4] p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-[#D62828]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Pending actions.</p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/programs"
              className="px-4 py-2 rounded-lg bg-white border hover:shadow-md transition"
            >
              Manage Programs
            </Link>

            <Link
              href="/admin/donations"
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#F2C411] to-[#D62828] shadow hover:brightness-105 transition"
            >
              Donations
            </Link>

            <Link
              href="/admin/volunteers"
              className="px-4 py-2 rounded-lg bg-white border hover:shadow-md transition"
            >
              Volunteers
            </Link>
          </div>
        </div>

        <aside className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-3">Admin Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Review pending approvals daily.</li>
            <li>Keep program descriptions updated.</li>
            <li>Monitor donation activity.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
