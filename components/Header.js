"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import programsDataRaw from "../data/programs.json";

/* slugify helper */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);

  const pathname = usePathname() || "/";
  const router = useRouter();

  const containerRef = useRef(null);
  const hoverTimeout = useRef(null);

  // Normalized category/program data
  const categories =
    programsDataRaw?.categories?.map((c) => ({
      ...c,
      programs: (c.programs || []).map((p) =>
        typeof p === "string"
          ? { title: p, slug: slugify(p) }
          : { ...p, slug: p.slug || slugify(p.title) }
      ),
    })) || [];

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Hover opening (with delay)
  const openPrograms = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setProgramsOpen(true), 70);
  };

  // Hover closing (slight delay)
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Vidhatha Society
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className={`font-medium ${
                isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`font-medium ${
                isActive("/about") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              About
            </Link>

            {/* Programs Dropdown Container */}
            <div
              ref={containerRef}
              className="relative"
              onMouseEnter={openPrograms}
              onMouseLeave={closePrograms}
            >
              <button
                className={`font-medium inline-flex items-center gap-2 ${
                  isActive("/programs")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Programs
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute left-0 top-full mt-3 w-[750px] max-w-[90vw] bg-white rounded-lg shadow-lg border p-4 transition-all duration-150 z-[999] ${
                  programsOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.key}>
                      <div className="font-semibold text-gray-800 mb-2">
                        {cat.title}
                      </div>
                      <ul className="space-y-2 text-sm">
                        {cat.programs.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/programs/${p.slug}`}
                              className="text-gray-600 hover:text-blue-600 block"
                              onClick={() => setProgramsOpen(false)}
                            >
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

            <Link
              href="/events"
              className={`font-medium ${
                isActive("/events") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Events
            </Link>

            <Link
              href="/gallery"
              className={`font-medium ${
                isActive("/gallery") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Gallery
            </Link>

            <Link
              href="/blog"
              className={`font-medium ${
                isActive("/blog") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/contact"
              className={`font-medium ${
                isActive("/contact") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Contact
            </Link>

            <Link
              href="/volunteer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Volunteer
            </Link>

            <Link
              href="/donate"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Donate
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
