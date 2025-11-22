// components/Header.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import programsDataRaw from "../data/programs.json"; // fallback if backend fails
import api from "@/lib/api"; // your axios instance (must have baseURL set to NEXT_PUBLIC_API_URL)

/* ---------- Local logo file (from uploaded assets) ---------- */
/* Developer note: this is a local path you uploaded earlier — tooling will transform it to a URL in your environment */
const LOGO_SRC = "/mnt/data/200eff3c-1b96-43a6-bfd0-c560bdd35e93.png";

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
      ...p,
    };
    map.get(key).programs.push(prog);
  }
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

/* ---------- Header component ---------- */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateSubOpen, setDonateSubOpen] = useState(false); // for hover submenu
  const [categories, setCategories] = useState(() =>
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

  const programsRef = useRef(null);
  const donateRef = useRef(null);
  const hoverTimeout = useRef(null);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Programs menu hover helpers
  const openPrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(true), 70);
  };
  const closePrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(false), 120);
  };

  // Donate menu hover helpers
  const openDonate = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setDonateOpen(true), 70);
  };
  const closeDonate = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setDonateSubOpen(false);
      setDonateOpen(false);
    }, 120);
  };
  const openDonateSub = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setDonateSubOpen(true), 70);
  };
  const closeDonateSub = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setDonateSubOpen(false), 120);
  };

  // Click outside close for both dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (programsRef.current && !programsRef.current.contains(e.target)) {
        setProgramsOpen(false);
      }
      if (donateRef.current && !donateRef.current.contains(e.target)) {
        setDonateOpen(false);
        setDonateSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch live programs from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await api.get("/api/programs?limit=1000");
        const items = res?.data?.items ?? res?.data?.programs ?? res?.data ?? [];
        const maybeArray = Array.isArray(items) ? items : (Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.data?.programs || []));

        if (!mounted) return;
        if (Array.isArray(maybeArray) && maybeArray.length > 0) {
          const grouped = normalizeBackendPrograms(maybeArray);
          setCategories(grouped);
        }
      } catch (e) {
        console.error("Header: failed to fetch programs:", e);
        if (!mounted) return;
        setErr(e?.response?.data?.error || e?.message || "Failed to load programs");
        // fallback: keep static programsDataRaw
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ---------------------------
     Donate links (as requested)
     --------------------------- */
  const DONATE_LINKS = {
    donations: "/donate",
    magazine: "/donate/magazine",
    books: "/donate/books",
    products: "/donate/products",
    services: "/donate/services",
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 relative rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
              {/* Prefer local uploaded logo if present */}
              <img
                src={LOGO_SRC}
                alt="Vidhatha Society"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // fallback to letter if local file missing
  e.currentTarget.style.display = "none";
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl pointer-events-none">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Vidhatha Society</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className={`font-medium ${isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>Home</Link>
            <Link href="/about" className={`font-medium ${isActive("/about") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>About</Link>

            {/* Programs Dropdown */}
            <div ref={programsRef} className="relative" onMouseEnter={openPrograms} onMouseLeave={closePrograms}>
              <button className={`font-medium inline-flex items-center gap-2 ${isActive("/programs") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>
                What we do
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>

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

            {/* Donate multi-level dropdown */}
            <div ref={donateRef} className="relative" onMouseEnter={openDonate} onMouseLeave={closeDonate}>
              <button
                onClick={() => setDonateOpen((s) => !s)} // click toggles on mobile
                className={`px-4 py-2 rounded-lg font-semibold ${isActive("/donate") ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}`}
              >
                Donate
              </button>

              <div className={`absolute right-0 top-full mt-3 w-56 bg-white rounded-lg shadow-lg border p-2 transition-all duration-150 z-[1000] ${donateOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible pointer-events-none"}`}>
                <ul className="text-sm">
                  <li>
                    <Link href={DONATE_LINKS.donations} className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => { setDonateOpen(false); setDonateSubOpen(false); }}>
                      Donations
                    </Link>
                  </li>

                  {/* Donate by Purchase item with submenu */}
                  <li className="relative" onMouseEnter={openDonateSub} onMouseLeave={closeDonateSub}>
                    <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 cursor-pointer">
                      <Link href={DONATE_LINKS.products} className="flex-1">Donate by Purchase</Link>
                      <svg className="w-4 h-4 ml-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M7 7l3-3 3 3" /></svg>
                    </div>

                    {/* Submenu positioned to the right */}
                    <div className={`absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-lg border p-2 transition-all duration-150 ${donateSubOpen ? "opacity-100 translate-x-0 visible" : "opacity-0 -translate-x-2 invisible pointer-events-none"}`}>
                      <ul className="text-sm">
                        <li>
                          <Link href={DONATE_LINKS.magazine} className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => { setDonateOpen(false); setDonateSubOpen(false); }}>
                            Magazine
                          </Link>
                        </li>
                        <li>
                          <Link href={DONATE_LINKS.books} className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => { setDonateOpen(false); setDonateSubOpen(false); }}>
                            Books
                          </Link>
                        </li>
                        <li>
                          <Link href={DONATE_LINKS.products} className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => { setDonateOpen(false); setDonateSubOpen(false); }}>
                            Products
                          </Link>
                        </li>
                        <li>
                          <Link href={DONATE_LINKS.services} className="block px-3 py-2 rounded hover:bg-gray-50" onClick={() => { setDonateOpen(false); setDonateSubOpen(false); }}>
                            Services
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2" aria-label="Toggle menu">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden mt-3 transition-max-height duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-[800px]" : "max-h-0"}`}>
          <div className="flex flex-col space-y-2 pb-4">
            <Link href="/" className={`block px-3 py-2 rounded ${isActive("/") ? "text-blue-600" : "text-gray-700"}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/about" className={`block px-3 py-2 rounded ${isActive("/about") ? "text-blue-600" : "text-gray-700"}`} onClick={() => setMobileMenuOpen(false)}>About</Link>

            {/* Mobile: Programs collapsible */}
            <details className="px-3">
              <summary className="cursor-pointer py-2 font-medium">What we do</summary>
              <div className="pl-4">
                {categories.map((cat) => (
                  <div key={cat.key} className="py-1">
                    <div className="font-semibold text-sm">{cat.title}</div>
                    <ul className="pl-2">
                      {cat.programs.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/programs/${p.slug}`} className="block py-1 text-sm text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>

            <Link href="/events" className="block px-3 py-2 rounded text-gray-700" onClick={() => setMobileMenuOpen(false)}>Events</Link>
            <Link href="/gallery" className="block px-3 py-2 rounded text-gray-700" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
            <Link href="/news" className="block px-3 py-2 rounded text-gray-700" onClick={() => setMobileMenuOpen(false)}>News</Link>
            <Link href="/contact" className="block px-3 py-2 rounded text-gray-700" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/volunteer" className="block px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setMobileMenuOpen(false)}>Volunteer</Link>

            {/* Mobile Donate - expand/collapse */}
            <details className="px-3">
              <summary className="cursor-pointer py-2 font-semibold bg-purple-600 text-white px-3 rounded">Donate</summary>
              <div className="pl-4 pt-2 pb-2">
                <Link href={DONATE_LINKS.donations} className="block py-1" onClick={() => setMobileMenuOpen(false)}>Donations</Link>
                <details className="pl-3">
                  <summary className="cursor-pointer py-1">Donate by Purchase</summary>
                  <div className="pl-3">
                    <Link href={DONATE_LINKS.magazine} className="block py-1" onClick={() => setMobileMenuOpen(false)}>Magazine</Link>
                    <Link href={DONATE_LINKS.books} className="block py-1" onClick={() => setMobileMenuOpen(false)}>Books</Link>
                    <Link href={DONATE_LINKS.products} className="block py-1" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                    <Link href={DONATE_LINKS.services} className="block py-1" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                  </div>
                </details>
              </div>
            </details>
          </div>
        </div>
      </nav>
    </header>
  );
}
