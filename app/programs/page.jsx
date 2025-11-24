"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import programsDataFallback from "../../data/programs.json";
import PageShell from "../../components/PageShell";
import SectionHeader from "../../components/SectionHeader";

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
  const map = new Map();

  (programs || []).forEach((p) => {
    const title = typeof p === "string" ? p : p.title;
    const category =
      typeof p === "object" && p.category ? p.category : "Uncategorized";
    const key = slugify(category);

    if (!map.has(key)) {
      map.set(key, { key, title: category, description: "", programs: [] });
    }
    map.get(key).programs.push(p);
  });

  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export default function ProgramsPage() {
  const [openKey, setOpenKey] = React.useState(null);
  const [categories, setCategories] = useState(
    () => programsDataFallback?.categories || []
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/programs?limit=1000");
        const items =
          res?.data?.items ?? res?.data?.programs ?? res?.data ?? [];
        const grouped = groupByCategory(items);
        if (!mounted) return;

        if (!grouped || grouped.length === 0) {
          setCategories(programsDataFallback?.categories || []);
        } else {
          setCategories(grouped);
        }
      } catch (e) {
        console.error("Failed to fetch programs:", e);
        if (mounted) {
          setErr(
            e?.response?.data?.error ||
              e?.message ||
              "Failed to load programs"
          );
          setCategories(programsDataFallback?.categories || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <PageShell>
        <SectionHeader
          eyebrow="Our programs"
          title="Explore initiatives under"
          highlight="Vidhatha Society"
          description="Loading programs…"
        />
        <div className="space-y-4 max-w-3xl">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Our programs"
        title="Explore initiatives under"
        highlight="Vidhatha Society"
        description="Click a category to view its programs. Click a program to view details and donation options."
      />

      {err && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          Error: {err}
        </div>
      )}

      <div className="space-y-6">
        {categories.map((cat) => {
          const open = openKey === cat.key;
          return (
            <section
              key={cat.key}
              className="
                rounded-2xl bg-white border border-[#F2C41133]
                shadow-sm overflow-hidden
                hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              <button
                onClick={() =>
                  setOpenKey((k) => (k === cat.key ? null : cat.key))
                }
                className="w-full flex items-center justify-between px-4 md:px-6 py-4 focus:outline-none"
                aria-expanded={open}
                aria-controls={`cat-${cat.key}`}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {cat.title}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div
                  className={`ml-4 inline-flex items-center justify-center w-9 h-9 rounded-full ${
                    open
                      ? "bg-[#FFF8E1] text-[#D62828]"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transform ${
                      open ? "rotate-180" : "rotate-0"
                    } transition-transform`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 01.707.293l6 6a1 1 0 01-1.414 1.414L10 5.414 4.707 10.707A1 1 0 113.293 9.293l6-6A1 1 0 0110 3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              <div
                id={`cat-${cat.key}`}
                className={`${
                  open ? "max-h-[800px] py-4 px-4 md:px-6" : "max-h-0 px-4"
                } transition-all overflow-hidden`}
              >
                {open && (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {cat.programs.map((p) => {
                      const title = typeof p === "string" ? p : p.title;
                      const slug =
                        typeof p === "string"
                          ? slugify(p)
                          : p.slug || slugify(p.title);
                      const short =
                        typeof p === "object" && p.short ? p.short : "";

                      return (
                        <Link
                          key={slug}
                          href={`/programs/${slug}`}
                          className="
                            block rounded-xl border border-[#F2C41133] bg-white
                            p-3 text-left text-sm
                            hover:-translate-y-0.5 hover:shadow-lg
                            transition-all duration-200
                          "
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {title}
                              </div>
                              {short && (
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {short}
                                </div>
                              )}
                            </div>
                            <svg
                              className="w-4 h-4 text-[#1D3A8A] mt-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
