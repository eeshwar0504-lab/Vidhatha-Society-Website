// components/Header.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import programsDataRaw from "../data/programs.json";
import api from "@/lib/api";

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

function normalizeBackendPrograms(items = []) {
  const map = new Map();
  for (const p of items) {
    if (!p) continue;
    const title = p.title || (typeof p === "string" ? p : "");
    const category =
      (p.category && String(p.category).trim()) || "Uncategorized";
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
  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateSubOpen, setDonateSubOpen] = useState(false);
  const [categories, setCategories] = useState(() =>
    (programsDataRaw?.categories || []).map((c) => ({
      ...c,
      programs: (c.programs || []).map((p) =>
        typeof p === "string"
          ? { title: p, slug: slugify(p) }
          : { ...p, slug: p.slug || slugify(p.title) }
      ),
    }))
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const pathname = usePathname() || "/";

  const programsRef = useRef(null);
  const donateRef = useRef(null);
  const hoverTimeout = useRef(null);

  const DONATE_LINKS = {
    donations: "/donate",
    magazine: "/donate/magazine",
    books: "/donate/books",
    products: "/donate/products",
    services: "/donate/services",
  };

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const openPrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(true), 70);
  };
  const closePrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(false), 120);
  };

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await api.get("/api/programs?limit=1000");
        const items =
          res?.data?.items ?? res?.data?.programs ?? res?.data ?? [];
        const maybeArray = Array.isArray(items)
          ? items
          : Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res?.data?.programs || [];

        if (!mounted) return;
        if (Array.isArray(maybeArray) && maybeArray.length > 0) {
          const grouped = normalizeBackendPrograms(maybeArray);
          setCategories(grouped);
        }
      } catch (e) {
        console.error("Header: failed to fetch programs:", e);
        if (!mounted) return;
        setErr(
          e?.response?.data?.error ||
            e?.message ||
            "Failed to load programs"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Letterhead-style top strip: yellow → red → blue */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F2C411] via-[#D62828] to-[#1D3A8A]" />
      <nav
        className="
          bg-white/85 backdrop-blur-lg border-b border-white/70
          shadow-sm
        "
      >
        <div className="container mx-auto px-4 py-3 md:py-4 relative">
          <div className="flex justify-between items-center gap-4">
            {/* Logo + title */}
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden shadow-md shadow-[#F2C411]/40 bg-white">
                <Image
                  src="/vidhatha-logo.jpg"
                  alt="Vidhatha Society logo"
                  fill
                  priority
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                  Vidhatha Society
                </span>
                <span className="hidden md:block text-xs text-[#D62828] font-medium tracking-wide">
                  Youth • Service • Community
                </span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/about")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                About
              </Link>

              {/* Programs dropdown */}
              <div
                ref={programsRef}
                className="relative"
                onMouseEnter={openPrograms}
                onMouseLeave={closePrograms}
              >
                <button
                  className={`text-sm font-medium inline-flex items-center gap-1.5 transition hover:-translate-y-0.5 ${
                    isActive("/programs")
                      ? "text-[#D62828]"
                      : "text-gray-700 hover:text-[#1D3A8A]"
                  }`}
                >
                  What we do
                  <span className="text-xs opacity-70">▼</span>
                </button>

                {/* DROPDOWN: centered, 90vw max to avoid being cut */}
                <div
                  className={`
                    absolute left-1/2 top-full mt-3 w-[90vw] max-w-[780px]
                    -translate-x-1/2
                    bg-white rounded-2xl shadow-2xl border border-[#F2C411]/40
                    p-4 transition-all duration-150 z-[999]
                    ${
                      programsOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-2 invisible pointer-events-none"
                    }
                  `}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {loading && (
                      <div className="col-span-3 text-sm text-gray-500">
                        Loading programs…
                      </div>
                    )}
                    {err && (
                      <div className="col-span-3 text-sm text-red-600">
                        Error loading programs
                      </div>
                    )}

                    {categories.map((cat) => (
                      <div key={cat.key}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[#F2C411] via-[#D62828] to-[#1D3A8A]" />
                          <div className="font-semibold text-gray-800 text-sm">
                            {cat.title}
                          </div>
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          {cat.programs.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/programs/${p.slug}`}
                                className="text-gray-600 hover:text-[#1D3A8A] inline-flex items-center gap-1"
                                onClick={() => setProgramsOpen(false)}
                              >
                                <span>•</span>
                                <span>{p.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/events"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/events")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                Events
              </Link>
              <Link
                href="/gallery"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/gallery")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                Gallery
              </Link>
              <Link
                href="/news"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/news")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                News
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition hover:-translate-y-0.5 ${
                  isActive("/contact")
                    ? "text-[#D62828]"
                    : "text-gray-700 hover:text-[#1D3A8A]"
                }`}
              >
                Contact
              </Link>

              {/* CTA cluster: Volunteer, Donate, Login */}
              <div className="flex items-center gap-3">
                {/* Volunteer button */}
                <Link
                  href="/volunteer"
                  className="
                    px-4 py-2 rounded-full text-sm font-semibold
                    bg-gradient-to-r from-[#F2C411] to-[#D62828] text-white
                    shadow-md shadow-[#D62828]/40
                    hover:brightness-105 hover:-translate-y-0.5
                    active:translate-y-0
                    transition
                  "
                >
                  Volunteer
                </Link>

                {/* Donate button + dropdown */}
                <div
                  ref={donateRef}
                  className="relative"
                  onMouseEnter={openDonate}
                  onMouseLeave={closeDonate}
                >
                  <button
                    onClick={() => setDonateOpen((s) => !s)}
                    className="
                      px-4 py-2 rounded-full text-sm font-semibold
                      bg-[#D62828] text-white hover:bg-[#B71D23]
                      shadow-md shadow-[#D62828]/40
                      transition hover:-translate-y-0.5 active:translate-y-0
                    "
                  >
                    Donate
                  </button>

                  <div
                    className={`
                      absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl
                      shadow-2xl border border-[#F2C411]/40 p-2 text-sm z-[1000]
                      ${
                        donateOpen
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 -translate-y-2 invisible pointer-events-none"
                      }
                    `}
                  >
                    <ul>
                      <li>
                        <Link
                          href={DONATE_LINKS.donations}
                          className="block px-3 py-2 rounded-xl hover:bg-[#FFF8E1]"
                          onClick={() => {
                            setDonateOpen(false);
                            setDonateSubOpen(false);
                          }}
                        >
                          Donations
                        </Link>
                      </li>

                      <li
                        className="relative"
                        onMouseEnter={openDonateSub}
                        onMouseLeave={closeDonateSub}
                      >
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FFF8E1] cursor-pointer">
                          <Link
                            href={DONATE_LINKS.products}
                            className="flex-1"
                          >
                            Donate by Purchase
                          </Link>
                          <span className="text-xs text-gray-500">▶</span>
                        </div>

                        {/* SUBMENU: opens to the LEFT */}
                        <div
                          className={`
                            absolute right-full top-0 mr-2 w-52 bg-white
                            rounded-2xl shadow-2xl border border-[#F2C411]/40 p-2
                            ${
                              donateSubOpen
                                ? "opacity-100 translate-x-0 visible"
                                : "opacity-0 translate-x-2 invisible pointer-events-none"
                            }
                          `}
                        >
                          <ul>
                            <li>
                              <Link
                                href={DONATE_LINKS.magazine}
                                className="block px-3 py-2 rounded-xl hover:bg-[#FFF8E1]"
                                onClick={() => {
                                  setDonateOpen(false);
                                  setDonateSubOpen(false);
                                }}
                              >
                                Magazine
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={DONATE_LINKS.books}
                                className="block px-3 py-2 rounded-xl hover:bg-[#FFF8E1]"
                                onClick={() => {
                                  setDonateOpen(false);
                                  setDonateSubOpen(false);
                                }}
                              >
                                Books
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={DONATE_LINKS.products}
                                className="block px-3 py-2 rounded-xl hover:bg-[#FFF8E1]"
                                onClick={() => {
                                  setDonateOpen(false);
                                  setDonateSubOpen(false);
                                }}
                              >
                                Products
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={DONATE_LINKS.services}
                                className="block px-3 py-2 rounded-xl hover:bg-[#FFF8E1]"
                                onClick={() => {
                                  setDonateOpen(false);
                                  setDonateSubOpen(false);
                                }}
                              >
                                Services
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Login button */}
                <Link
                  href="/login"
                  className="
                    px-4 py-2 rounded-full text-sm font-semibold
                    border border-[#D62828] text-[#D62828]
                    bg-white/90
                    hover:bg-[#D62828] hover:text-white
                    shadow-sm hover:shadow-md
                    transition
                    hover:-translate-y-0.5 active:translate-y-0
                  "
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 bg-white/70"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <div
            className={`
              lg:hidden mt-2 transition-max-height duration-300 overflow-hidden
              ${mobileMenuOpen ? "max-h-[800px]" : "max-h-0"}
            `}
          >
            <div className="flex flex-col space-y-1 pb-3 pt-2 bg-white/90 rounded-2xl border border-gray-100">
              <Link
                href="/"
                className={`block px-4 py-2 rounded-xl text-sm ${
                  isActive("/")
                    ? "text-[#D62828] bg-[#FFF8E1]"
                    : "text-gray-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`block px-4 py-2 rounded-xl text-sm ${
                  isActive("/about")
                    ? "text-[#D62828] bg-[#FFF8E1]"
                    : "text-gray-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <details className="px-4 text-sm">
                <summary className="cursor-pointer py-2 font-medium">
                  What we do
                </summary>
                <div className="pl-2 pb-2 pt-1 space-y-1">
                  {categories.map((cat) => (
                    <div key={cat.key} className="py-1">
                      <div className="font-semibold text-xs text-gray-700">
                        {cat.title}
                      </div>
                      <ul className="pl-2">
                        {cat.programs.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/programs/${p.slug}`}
                              className="block py-0.5 text-xs text-gray-700"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>

              <Link
                href="/events"
                className="block px-4 py-2 rounded-xl text-sm text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/gallery"
                className="block px-4 py-2 rounded-xl text-sm text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/news"
                className="block px-4 py-2 rounded-xl text-sm text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 rounded-xl text-sm text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Login (mobile) */}
              <Link
                href="/login"
                className="block px-4 py-2 rounded-xl text-sm text-[#D62828] border border-[#F2C411]/60 mx-4 mt-1 text-center bg-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                href="/volunteer"
                className="block mx-4 mt-1 px-4 py-2 rounded-full text-center text-sm font-semibold bg-gradient-to-r from-[#F2C411] to-[#D62828] text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Volunteer
              </Link>

              <details className="px-4 text-sm">
                <summary className="cursor-pointer py-2 font-semibold bg-[#1D3A8A]/90 text-white px-3 rounded-xl">
                  Donate
                </summary>
                <div className="pl-3 pt-2 pb-2 space-y-1 bg-[#E3F2FD] rounded-xl mt-1">
                  <Link
                    href={DONATE_LINKS.donations}
                    className="block py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Donations
                  </Link>
                  <details className="pl-2">
                    <summary className="cursor-pointer py-1 text-sm">
                      Donate by Purchase
                    </summary>
                    <div className="pl-2 text-xs space-y-1 pt-1">
                      <Link
                        href={DONATE_LINKS.magazine}
                        className="block py-0.5"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Magazine
                      </Link>
                      <Link
                        href={DONATE_LINKS.books}
                        className="block py-0.5"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Books
                      </Link>
                      <Link
                        href={DONATE_LINKS.products}
                        className="block py-0.5"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Products
                      </Link>
                      <Link
                        href={DONATE_LINKS.services}
                        className="block py-0.5"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Services
                      </Link>
                    </div>
                  </details>
                </div>
              </details>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
