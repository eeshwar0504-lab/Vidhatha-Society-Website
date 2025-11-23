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
 * - supports Edit / View / Delete (DELETE /api/programs/:id)
 */

function buildAbsoluteUrl(candidate, base) {
  if (!candidate) return null;
  // candidate may be an object or string (some APIs return { url: '...' })
  if (typeof candidate === "object") {
    // try common keys
    const keys = ["url", "fileUrl", "path", "location"];
    for (const k of keys) {
      if (candidate[k]) return buildAbsoluteUrl(candidate[k], base);
    }
    return null;
  }
  // string
  const s = String(candidate).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s; // already absolute
  // sometimes returned like uploads/abc.jpg or /uploads/abc.jpg
  // ensure single slash between base and path
  if (!base) return s.startsWith("/") ? s : `/${s}`;
  const baseNoSlash = base.endsWith("/") ? base.slice(0, -1) : base;
  const pathWithSlash = s.startsWith("/") ? s : `/${s}`;
  return `${baseNoSlash}${pathWithSlash}`;
}

function ProgramCard({ program, onDelete }) {
  const base = api.defaults?.baseURL || ""; // e.g. http://localhost:4000
  // Try multiple fields that backend might return
  const candidates = [
    program?.imageUrl,
    program?.image, // sometimes single field
    (program?.images && program.images[0]) || null,
    program?.thumbnail,
    program?.fileUrl,
    program?.path,
    program?.location,
  ];

  let imageSrc = null;
  for (const c of candidates) {
    const abs = buildAbsoluteUrl(c, base);
    if (abs) {
      imageSrc = abs;
      break;
    }
  }

  // Fallback: if program has media array with objects that include url/path
  if (!imageSrc && Array.isArray(program?.media) && program.media.length > 0) {
    for (const m of program.media) {
      const abs = buildAbsoluteUrl(m?.url || m?.path || m, base);
      if (abs) { imageSrc = abs; break; }
    }
  }

  const title = program?.title || "Untitled program";

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm w-full max-w-xs flex flex-col">
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

      <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{program?.short || program?.shortDescription || ""}</p>

      <div className="flex items-center gap-2 mt-auto">
        <span className="px-2 py-1 rounded-full bg-amber-400 text-xs">Draft</span>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => {
            // navigate handled by parent - but keep simple behavior
            const id = program._id || program.id || program.slug;
            window.location.href = `/admin/programs/${id}`;
          }}
        >
          Edit
        </button>

        <button
          className="px-3 py-1 border rounded"
          onClick={() => {
            const slug = program.slug || program._id || program.id;
            window.open(`/programs/${slug}`, "_blank");
          }}
        >
          View
        </button>

        <button
          className="px-3 py-1 border rounded text-red-500 ml-auto"
          onClick={() => onDelete(program)}
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
      const res = await api.get("/api/programs?limit=100");
      const data = res?.data ?? {};
      // backend might return { items: [... ] } or { programs: [...] } or plain array
      const items = data.items || data.programs || (Array.isArray(data) ? data : data);
      setPrograms(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load programs", err);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (program) => {
    const id = program._id || program.id || program.slug;
    if (!id) {
      toast.error("Cannot determine program id to delete");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${program.title || id}"? This cannot be undone.`)) return;

    try {
      // call backend
      const res = await api.delete(`/api/programs/${id}`);
      // treat 200/204 as success
      if (res?.status === 200 || res?.status === 204 || res?.data?.ok) {
        setPrograms((prev) => prev.filter((p) => String((p._id || p.id || p.slug)) !== String(id)));
        toast.success("Program deleted");
      } else {
        console.warn("Unexpected delete response:", res);
        toast.error(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Delete failed";
      toast.error(msg);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Programs</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/programs/create")}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              + New Program
            </button>
            <button onClick={fetchPrograms} className="px-4 py-2 border rounded">Refresh</button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search programs by title, description..."
            className="w-full border p-2 rounded"
            onChange={(e) => {
              const q = (e.target.value || "").trim().toLowerCase();
              if (!q) { fetchPrograms(); return; }
              setPrograms((prev) =>
                prev.filter((p) => {
                  const title = (p.title || "").toLowerCase();
                  const short = (p.short || p.shortDescription || "").toLowerCase();
                  return title.includes(q) || short.includes(q);
                })
              );
            }}
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading programs…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.length === 0 ? (
              <div className="text-gray-500">No programs found.</div>
            ) : (
              programs.map((p) => {
                const key = p._id || p.slug || p.id || JSON.stringify(p).slice(0, 8);
                return <ProgramCard key={key} program={p} onDelete={handleDelete} />;
              })
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
