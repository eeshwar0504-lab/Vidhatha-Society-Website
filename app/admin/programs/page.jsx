// app/admin/programs/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProgramsListPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPrograms = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/api/programs");
      const data = res?.data;
      // Accept multiple shapes
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.programs)) list = data.programs;
      else if (Array.isArray(data?.docs)) list = data.docs;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.result)) list = data.result;
      setPrograms(list);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id) => {
    const ok = confirm("Delete this program? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/programs/${id}`);
      // remove from list locally
      setPrograms((prev) => prev.filter((p) => (p._id || p.id || p.slug) !== id));
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Programs</h1>
          <Link href="/admin/programs/create" className="px-4 py-2 bg-green-600 text-white rounded">+ Create Program</Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : programs.length === 0 ? (
          <div className="text-gray-600">No programs found.</div>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => {
                  const id = p._id || p.id || p.slug;
                  return (
                    <tr key={id} className="border-t">
                      <td className="p-3">{p.title}</td>
                      <td className="p-3 capitalize">{p.category}</td>
                      <td className="p-3">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/programs/${id}/edit`} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</Link>
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            className="px-2 py-1 border rounded text-red-600"
                          >
                            {deletingId === id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
