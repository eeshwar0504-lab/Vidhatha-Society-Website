// app/admin/programs/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function ProgramsList() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/programs");
        if (mounted) setPrograms(res.data.docs || res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Programs</h1>
          <Link href="/admin/programs/create" className="px-3 py-1 bg-blue-600 text-white rounded">
            Create Program
          </Link>
        </div>

        {loading && <div>Loading...</div>}
        {err && <div className="text-red-600">{err}</div>}
        {!loading && !programs.length && <div>No programs yet.</div>}
        <div className="grid gap-4">
          {programs.map((p) => (
            <div key={p._id || p.id || p.slug} className="p-4 border rounded">
              <h3 className="font-semibold">{p.title || p.name}</h3>
              <p className="text-sm">{p.shortDescription || p.description?.slice?.(0, 120)}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
