"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import programsDataRaw from "../data/programs.json"; // fallback if backend fails
import api from "@/lib/api"; // your axios instance (must have baseURL set to NEXT_PUBLIC_API_URL)

/* slugify helper */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * normalizeBackendPrograms:
 * - Accepts programs array (flat) from /api/programs (items/programs)
 * - Returns categories array matching the structure your Header expects:
 *   [{ key, title, description?, programs: [{ title, slug, ... }] }]
 */
function normalizeBackendPrograms(items = []) {
  // Map by category
  const map = new Map();
  for (const p of items) {
    if (!p) continue;
    const title = p.title || (typeof p === "string" ? p : "");
    const category = (p.category && String(p.category).trim()) || "Uncategorized";
    const key = slugify(category);
    if (!map.has(key)) {
      map.set(key, { key, title: category, description: "", programs: [] });
    }
    const prog = {
      title,
      slug: p.slug || slugify(title),
      short: p.short || p.shortDescription || p.excerpt || "",
      ...p, // keep other fields if needed (image, id)
    };
    map.get(key).programs.push(prog);
  }

  // return sorted array
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

/* ---------- Header component ---------- */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [categories, setCategories] = useState(() =>
    // convert static fallback file into normalized structure expected
    (programsDataRaw?.categories || []).map((c) => ({
      ...c,
      programs: (c.programs || []).map((p) =>
        typeof p === "string" ? { title: p, slug: slugify(p) } : { ...p, slug: p.slug || slugify(p.title) }
      ),
    }))
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const pathname = usePathname() || "/";

  const containerRef = useRef(null);
  const hoverTimeout = useRef(null);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Hover open/close helpers
  const openPrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(true), 70);
  };
  const closePrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(false), 120);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setProgramsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch live programs from backend on client mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Request many items (tune limit if required)
        const res = await api.get("/api/programs?limit=1000");
        const items = res?.data?.items ?? res?.data?.programs ?? res?.data ?? [];

        // If returned something that looks like one object { program: {...} } try to unwrap
        // (defensive)
        const maybeArray = Array.isArray(items) ? items : (Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.data?.programs || []));

        if (!mounted) return;

        if (Array.isArray(maybeArray) && maybeArray.length > 0) {
          const grouped = normalizeBackendPrograms(maybeArray);
          setCategories(grouped);
        } else {
          // backend returned nothing -> keep static fallback
          // (programsDataRaw already used as initial state)
        }
      } catch (e) {
        console.error("Header: failed to fetch programs:", e);
        if (!mounted) return;
        setErr(e?.response?.data?.error || e?.message || "Failed to load programs");
        // keep static fallback
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Vidhatha Society</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className={`font-medium ${isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Home</Link>
            <Link href="/about" className={`font-medium ${isActive("/about") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>About</Link>

            {/* Programs Dropdown Container */}
            <div ref={containerRef} className="relative" onMouseEnter={openPrograms} onMouseLeave={closePrograms}>
              <button className={`font-medium inline-flex items-center gap-2 ${isActive("/programs") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>
                What we do
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute left-0 top-full mt-3 w-[750px] max-w-[90vw] bg-white rounded-lg shadow-lg border p-4 transition-all duration-150 z-[999] ${programsOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"}`}>
                <div className="grid grid-cols-3 gap-4">
                  {loading && <div className="col-span-3 text-sm text-gray-500">Loading programs…</div>}
                  {err && <div className="col-span-3 text-sm text-red-600">Error loading programs</div>}

                  {categories.map((cat) => (
                    <div key={cat.key}>
                      <div className="font-semibold text-gray-800 mb-2">{cat.title}</div>
                      <ul className="space-y-2 text-sm">
                        {cat.programs.map((p) => (
                          <li key={p.slug}>
                            <Link href={`/programs/${p.slug}`} className="text-gray-600 hover:text-blue-600 block" onClick={() => setProgramsOpen(false)}>
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/events" className={`font-medium ${isActive("/events") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Events</Link>
            <Link href="/gallery" className={`font-medium ${isActive("/gallery") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Gallery</Link>
            <Link href="/news" className={`font-medium ${isActive("/news") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>News</Link>
            <Link href="/contact" className={`font-medium ${isActive("/contact") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Contact</Link>
            <Link href="/volunteer" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Volunteer</Link>
            <Link href="/donate" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">Donate</Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2" aria-label="Toggle menu">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
