// app/admin/programs/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api"; // change to "../../../lib/api" if not using path alias
import ProtectedRoute from "@/components/ProtectedRoute"; // change path if needed

export default function ProgramsListPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/api/programs");
        const data = res?.data;

        let list = [];

        // Accept multiple backend shapes
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.programs)) list = data.programs;
        else if (Array.isArray(data?.docs)) list = data.docs;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.result)) list = data.result;

        if (mounted) setPrograms(list);
      } catch (e) {
        const msg =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch programs";
        if (mounted) setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Programs</h1>

          <Link
            href="/admin/programs/create"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Create Program
          </Link>
        </div>

        {/* Loading */}
        {loading && <div>Loading...</div>}

        {/* Error */}
        {err && <div className="text-red-600">{err}</div>}

        {/* If empty */}
        {!loading && !err && programs.length === 0 && (
          <div className="text-gray-600">No programs found.</div>
        )}

        {/* Table */}
        {!loading && !err && programs.length > 0 && (
          <table className="w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Title</th>
                <th className="p-3 border text-left">Category</th>
                <th className="p-3 border text-left">Created</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {programs.map((p) => (
                <tr key={p._id || p.id || p.slug} className="border-b">
                  <td className="p-3 border">{p.title}</td>
                  <td className="p-3 border capitalize">{p.category}</td>
                  <td className="p-3 border">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 border">
                    <Link
                      href={`/admin/programs/${p._id || p.id || p.slug}/edit`}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedRoute>
  );
}
