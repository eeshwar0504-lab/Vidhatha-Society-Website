"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ToastProvider";

/* ---------- Local project PDF reference ---------- */
const PROJECT_SUMMARY_PDF = "/mnt/data/Vidhatha_Society_A_to_Z_Summary.pdf";

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white/5 p-4 rounded-2xl shadow-sm">
      <div className="h-36 bg-gray-200/30 rounded-md mb-4" />
      <div className="h-4 bg-gray-200/30 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200/30 rounded w-1/2" />
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="p-12 text-center border rounded-lg bg-white/5">
      <h3 className="text-xl font-semibold mb-2">No programs found</h3>
      <p className="text-sm text-gray-300 mb-4">You have not created any programs yet. Click below to add a new program.</p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/admin/programs/create" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Program</Link>
        <button onClick={onCreate} className="px-4 py-2 border rounded">Explore Sample PDF</button>
      </div>
    </div>
  );
}

export default function AdminProgramsListPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [total, setTotal] = useState(0);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, category]);

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setPage(1);
      fetchPrograms(search, category, 1, limit);
    }, 400);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function fetchPrograms(searchParam = search, categoryParam = category, pageParam = page, limitParam = limit) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageParam, limit: limitParam };
      if (searchParam) params.search = searchParam;
      if (categoryParam) params.category = categoryParam;

      const res = await api.get("/api/programs", { params });

      let items = [];
      let totalCount = 0;

      if (Array.isArray(res?.data?.programs)) {
        items = res.data.programs;
        totalCount = res.data.total ?? items.length;
      } else if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
        totalCount = res.data.total ?? items.length;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
        totalCount = items.length;
      } else if (Array.isArray(res?.data?.docs)) {
        items = res.data.docs;
        totalCount = res.data.totalDocs ?? items.length;
      } else if (res?.data?.program) {
        items = Array.isArray(res.data.program) ? res.data.program : [res.data.program];
        totalCount = items.length;
      } else {
        items = res?.data?.data?.programs || res?.data?.data?.docs || [];
        totalCount = res?.data?.data?.total || items.length;
      }

      setPrograms(items);
      setTotal(Number(totalCount) || items.length);
    } catch (err) {
      console.error("Failed to fetch programs", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch programs");
      toast.error(err?.response?.data?.message || err?.message || "Failed to fetch programs");
      setPrograms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const performDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/programs/${deleteId}`);
      setPrograms((prev) => prev.filter((p) => (p._id || p.id) !== deleteId));
      setDeleteId(null);
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Program deleted");
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to delete program";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const goToEdit = (idOrSlug) => router.push(`/admin/programs/${idOrSlug}/edit`);
  const goToView = (slugOrId) => router.push(`/programs/${slugOrId}`);

  const totalPages = Math.max(1, Math.ceil((total || programs.length) / limit));

  const openProjectPdf = () => {
    // local path from workspace
    window.open(PROJECT_SUMMARY_PDF, "_blank");
    toast.info("Opened project summary PDF (local workspace)");
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Programs</h1>

          <div className="flex items-center gap-3">
            <Link href="/admin/programs/create" className="px-4 py-2 bg-indigo-600 text-white rounded">+ New Program</Link>
            <button onClick={() => fetchPrograms("", "", 1, limit)} className="px-3 py-2 border rounded">Refresh</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search programs by title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="w-48">
            <select className="w-full border p-2 rounded" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="awareness">Awareness</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          <div className="w-36 flex items-center gap-2">
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="w-full border p-2 rounded">
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : programs.length === 0 ? (
          <EmptyState onCreate={openProjectPdf} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((p) => {
                const id = p._id || p.id || (p._doc && p._doc._id) || p.slug;
                const title = p.title || p.name || "Untitled program";
                const short = p.short || p.shortDescription || p.excerpt || "";
                const thumb = p.thumbnailUrl || p.imageUrl || (p.images && p.images[0]) || null;
                const isPublished = typeof p.isPublished !== "undefined" ? p.isPublished : p.published || false;

                return (
                  <div key={id} className="bg-white/5 p-4 rounded-2xl shadow-sm flex flex-col">
                    <div className="h-40 w-full rounded-md mb-4 overflow-hidden bg-gray-50">
                      {thumb ? (
                        <img src={thumb} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{title}</h3>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-3">{short}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className={`text-xs px-2 py-1 rounded-full ${isPublished ? "bg-green-600" : "bg-yellow-600"}`}>
                        {isPublished ? "Published" : "Draft"}
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => goToEdit(id)} className="px-3 py-1 rounded border text-sm">Edit</button>
                        <button onClick={() => goToView(p.slug || id)} className="px-3 py-1 rounded bg-white/5 text-sm">View</button>
                        <button onClick={() => confirmDelete(id)} className="px-3 py-1 rounded border text-sm text-red-400">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing page {page} of {Math.max(1, Math.ceil((total || programs.length) / limit))} — {total} programs
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                <div className="px-3 py-1 border rounded">Page {page}</div>
                <button onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil((total || programs.length) / limit)), p + 1))} disabled={page >= Math.max(1, Math.ceil((total || programs.length) / limit))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
            <div className="bg-white rounded-lg p-6 z-60 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Delete Program?</h3>
              <p className="text-sm text-gray-600 mb-4">This will permanently delete the program. Are you sure?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={performDelete} disabled={deleting} className="px-3 py-1 rounded bg-red-600 text-white">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
