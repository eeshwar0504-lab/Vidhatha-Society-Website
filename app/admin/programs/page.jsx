// app/admin/programs/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ToastProvider";

/**
 * Programs listing (admin)
 * - fetches /api/programs
 * - ensures program image URL is absolute (prefixes api.baseURL when needed)
 * - shows placeholder when no image
 */

function ProgramCard({ program }) {
  const base = api.defaults?.baseURL || "";
  const firstImage = (program?.images && program.images.length > 0 && program.images[0]) || null;

  // Build absolute URL:
  const imageSrc = firstImage
    ? firstImage.startsWith("http://") || firstImage.startsWith("https://")
      ? firstImage
      : `${base}${firstImage.startsWith("/") ? "" : "/"}${firstImage}` // ensures /uploads/...
    : null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm w-full max-w-xs">
      <div className="h-40 bg-gray-50 rounded mb-4 flex items-center justify-center overflow-hidden relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={program.title || "program image"}
            className="object-cover w-full h-full"
            onError={(e) => {
              // hide broken image and leave placeholder background
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-1 truncate">{program.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{program.short || ""}</p>

      <div className="flex items-center gap-2 mt-auto">
        <span className="px-2 py-1 rounded-full bg-amber-400 text-xs">Draft</span>
        <button className="px-3 py-1 border rounded">Edit</button>
        <button className="px-3 py-1 border rounded">View</button>
        <button
          className="px-3 py-1 border rounded text-red-500"
          onClick={() => toast.info("Delete handled elsewhere")}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/programs");
      const data = res?.data ?? {};
      const items = data.items || data.programs || data || [];
      setPrograms(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load programs", err);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Programs</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/admin/programs/create")} className="px-4 py-2 bg-purple-600 text-white rounded">
              + New Program
            </button>
            <button onClick={fetchPrograms} className="px-4 py-2 border rounded">Refresh</button>
          </div>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Search programs by title, description..." className="w-full border p-2 rounded" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading programs…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.length === 0 ? (
              <div className="text-gray-500">No programs found.</div>
            ) : (
              programs.map((p) => <ProgramCard key={p._id || p.slug || Math.random()} program={p} />)
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
