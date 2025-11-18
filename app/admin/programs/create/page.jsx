// app/admin/programs/create/page.jsx
"use client";

import React, { useState } from "react";
import api from "../../../../lib/api";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";

export default function ProgramCreate() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const payload = { title, shortDescription: shortDesc, description: desc };
      const res = await api.post("/api/programs", payload);
      // on success go back to list (or open detail)
      router.push("/admin/programs");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl mb-4">Create Program</h1>
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block mb-1">Short description</label>
            <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={6} className="w-full border p-2 rounded" />
          </div>

          <div>
            <button disabled={busy} className="px-4 py-2 bg-green-600 text-white rounded">
              {busy ? "Creating..." : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
