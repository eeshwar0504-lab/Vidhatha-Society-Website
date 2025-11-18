// app/admin/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div>
          <span className="mr-4">Hello, {user?.name || user?.email}</span>
          <button onClick={logout} className="px-3 py-1 border rounded">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 border rounded">Programs: (placeholder)</div>
        <div className="p-4 border rounded">Users: (placeholder)</div>
        <div className="p-4 border rounded">Stats: (placeholder)</div>
      </div>
    </div>
  );
}
