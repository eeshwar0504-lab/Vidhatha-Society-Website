"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api"; // ensure this exists and baseURL = NEXT_PUBLIC_API_URL
// fallback to static data if you want — optional
import programsDataFallback from "../../data/programs.json";

/* slugify same as before */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* group flat program list into categories */
function groupByCategory(programs) {
  // programs: array of program objects (with category) or old format
  const map = new Map();

  (programs || []).forEach((p) => {
    // support old program shapes (string)
    const title = typeof p === "string" ? p : p.title;
    const category = (typeof p === "object" && p.category) ? p.category : "Uncategorized";
    const key = slugify(category);

    if (!map.has(key)) {
      map.set(key, { key, title: category, description: "", programs: [] });
    }
    map.get(key).programs.push(p);
  });

  // convert to array and keep stable sorting (alphabetical by title)
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export default function ProgramsPage() {
  const [openKey, setOpenKey] = React.useState(null);
  const [categories, setCategories] = useState(() => programsDataFallback?.categories || []);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // request many items (adjust limit as needed)
        const res = await api.get("/api/programs?limit=1000");
        // API returns items in .items (or .programs) per your backend code
        const items = res?.data?.items ?? res?.data?.programs ?? res?.data ?? [];
        // items may already be paginated objects
        const grouped = groupByCategory(items);
        if (!mounted) return;
        // If grouped is empty, fallback to static JSON structure
        if (!grouped || grouped.length === 0) {
          setCategories(programsDataFallback?.categories || []);
        } else {
          setCategories(grouped);
        }
      } catch (e) {
        console.error("Failed to fetch programs:", e);
        if (mounted) {
          setErr(e?.response?.data?.error || e?.message || "Failed to load programs");
          // fallback to static JSON if available
          setCategories(programsDataFallback?.categories || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Our Programs</h1>
        <p className="text-gray-600 mb-8 max-w-2xl">Loading programs…</p>
        <div className="space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Our Programs</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Click a category to view its programs. Click a program to view details and donation options.
      </p>

      {err && <div className="mb-4 text-red-600">Error: {err}</div>}

      <div className="space-y-6">
        {categories.map((cat) => {
          const open = openKey === cat.key;
          return (
            <section key={cat.key} className="border rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenKey((k) => (k === cat.key ? null : cat.key))}
                className="w-full flex items-center justify-between p-4 md:p-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-expanded={open}
                aria-controls={`cat-${cat.key}`}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">{cat.title}</h2>
                  {cat.description && <p className="text-sm text-gray-600 mt-1">{cat.description}</p>}
                </div>

                <div className={`ml-4 inline-flex items-center justify-center w-9 h-9 rounded-full ${open ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-700"}`}>
                  <svg className={`w-5 h-5 transform ${open ? "rotate-180" : "rotate-0"} transition-transform`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l6 6a1 1 0 01-1.414 1.414L10 5.414 4.707 10.707A1 1 0 113.293 9.293l6-6A1 1 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              <div id={`cat-${cat.key}`} className={`${open ? "max-h-[800px] py-4 px-4" : "max-h-0 overflow-hidden px-4"} transition-all`}>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.programs.map((p) => {
                    // p might be object (preferred) or string (fallback)
                    const title = typeof p === "string" ? p : p.title;
                    const slug = typeof p === "string" ? slugify(p) : (p.slug || slugify(p.title));
                    const short = typeof p === "object" && p.short ? p.short : "";
                    return (
                      <Link key={slug} href={`/programs/${slug}`} className="block p-3 rounded-lg border hover:shadow-sm transition bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-800">{title}</div>
                            {short ? <div className="text-xs text-gray-500 mt-1">{short}</div> : null}
                          </div>
                          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
