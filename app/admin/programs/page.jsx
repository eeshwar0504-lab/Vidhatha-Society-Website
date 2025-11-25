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
 *
 * UI tweaks:
 * - smaller action buttons (Draft / Edit / View / Delete)
 * - hover animations (cards lift & shadow, buttons scale on hover)
 * - compact layout while retaining responsiveness
 */

function buildAbsoluteUrl(candidate, base) {
  if (!candidate) return null;
  if (typeof candidate === "object") {
    const keys = ["url", "fileUrl", "path", "location"];
    for (const k of keys) {
      if (candidate[k]) return buildAbsoluteUrl(candidate[k], base);
    }
    return null;
  }
  const s = String(candidate).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (!base) return s.startsWith("/") ? s : `/${s}`;
  const baseNoSlash = base.endsWith("/") ? base.slice(0, -1) : base;
  const pathWithSlash = s.startsWith("/") ? s : `/${s}`;
  return `${baseNoSlash}${pathWithSlash}`;
}

function ProgramCard({ program, onDelete }) {
  const base = api.defaults?.baseURL || "";
  const candidates = [
    program?.imageUrl,
    program?.image,
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

  if (!imageSrc && Array.isArray(program?.media) && program.media.length > 0) {
    for (const m of program.media) {
      const abs = buildAbsoluteUrl(m?.url || m?.path || m, base);
      if (abs) {
        imageSrc = abs;
        break;
      }
    }
  }

  const title = program?.title || "Untitled program";

  return (
    <article
      className="bg-white rounded-xl p-4 shadow-sm w-full max-w-xs flex flex-col
                 transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg
                 focus-within:ring-2 focus-within:ring-indigo-200"
      aria-labelledby={`program-${program._id || program.slug || title}`}
    >
      <div className="h-36 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={program.title || "program image"}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>

      <h3 id={`program-${program._id || program.slug || title}`} className="text-lg font-semibold mb-1 truncate">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {program?.short || program?.shortDescription || ""}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        <span
          className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-xs font-medium
                     inline-flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          Draft
        </span>

        <button
          className="px-2 py-1 text-xs rounded-md border text-gray-700 hover:scale-105 transform transition
                     focus:outline-none focus:ring-2 focus:ring-indigo-200"
          onClick={() => {
            const id = program._id || program.id || program.slug;
            window.location.href = `/admin/programs/${id}`;
          }}
          aria-label={`Edit ${title}`}
        >
          Edit
        </button>

        <button
          className="px-2 py-1 text-xs rounded-md border text-gray-700 hover:scale-105 transform transition"
          onClick={() => {
            const slug = program.slug || program._id || program.id;
            window.open(`/programs/${slug}`, "_blank");
          }}
          aria-label={`View ${title}`}
        >
          View
        </button>

        <button
          className="px-2 py-1 text-xs rounded-md border text-red-500 ml-auto hover:scale-105 transform transition
                     focus:outline-none focus:ring-2 focus:ring-red-200"
          onClick={() => onDelete(program)}
          aria-label={`Delete ${title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/programs?limit=100");
      const data = res?.data ?? {};
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
      const res = await api.delete(`/api/programs/${id}`);
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
              className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:shadow-lg transform hover:-translate-y-0.5 transition"
              aria-label="Create new program"
            >
              + New Program
            </button>
            <button
              onClick={fetchPrograms}
              className="px-4 py-2 border rounded hover:bg-gray-50 transition"
              aria-label="Refresh programs"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search programs by title, description..."
            className="w-full border p-2 rounded"
            onChange={(e) => {
              const q = (e.target.value || "").trim().toLowerCase();
              if (!q) {
                fetchPrograms();
                return;
              }
              setPrograms((prev) =>
                prev.filter((p) => {
                  const title = (p.title || "").toLowerCase();
                  const short = (p.short || p.shortDescription || "").toLowerCase();
                  return title.includes(q) || short.includes(q);
                })
              );
            }}
            aria-label="Search programs"
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
