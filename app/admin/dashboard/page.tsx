// app/admin/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex items-center gap-4">
          <span className="font-medium">
            Welcome, {user?.name || user?.email}
          </span>

          <button
            onClick={logout}
            className="px-4 py-1 rounded border text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Programs Card */}
        <div className="p-5 border rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Programs</h2>
          <p className="text-gray-600 text-sm mb-3">
            Manage programs, create new ones, and edit existing initiatives.
          </p>

          <div className="flex gap-3">
            <Link
              href="/admin/programs"
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View
            </Link>

            <Link
              href="/admin/programs/create"
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Create
            </Link>
          </div>
        </div>

        {/* Users Card */}
        <div className="p-5 border rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-gray-600 text-sm mb-3">
            Manage admin users and their roles. (Coming soon)
          </p>

          <button
            disabled
            className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* Stats Card */}
        <div className="p-5 border rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Statistics</h2>
          <p className="text-gray-600 text-sm mb-3">
            View system-wide statistics. (Dev A will provide API Day-2)
          </p>

          <button
            disabled
            className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

      </div>
    </div>
  );
}
