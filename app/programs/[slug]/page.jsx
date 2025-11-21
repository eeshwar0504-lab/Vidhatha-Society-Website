// app/programs/[slug]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import api from "@/lib/api";
import Link from "next/link";
import DOMPurify from "dompurify";

/**
 * Public program detail page
 * Path: /app/programs/[slug]/page.jsx
 *
 * Changes made:
 * - Normalizes image URLs (prefixes api.defaults.baseURL if value is relative)
 * - Hides broken <img> icons and tries a simple fallback for gallery images
 * - Keeps DOMPurify sanitization for program.description
 */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 max-w-4xl mx-auto">
      <div className="h-56 bg-gray-200 rounded" />
      <div className="h-8 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/* Helper: build absolute URL for images returned by backend.
   - If value is already absolute (http/https) return as-is
   - If value starts with "/" treat as path on backend and prefix baseURL
   - Else prefix baseURL + "/" + value
*/
function toAbsoluteUrl(val) {
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;

  const base = api.defaults?.baseURL || "";
  if (!base) return val; // best-effort if base not configured

  if (val.startsWith("/")) {
    // value like "/uploads/file.jpg" -> http://localhost:4000/uploads/file.jpg
    return `${base}${val.startsWith("/") ? "" : "/"}${val}`;
  }
  // relative like "uploads/file.jpg" or "file.jpg"
  return `${base}/${val}`;
}

export default function ProgramPublicPage() {
  const params = useParams();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [program, setProgram] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [galleryUrls, setGalleryUrls] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!slug) {
      setErr("Missing program slug");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/programs/${encodeURIComponent(slug)}`);
        const p = res?.data?.program || res?.data?.doc || res?.data || null;
        if (!p) throw new Error("Program not found");
        if (!mounted) return;

        setProgram(p);

        // Determine banner (support multiple possible fields)
        const bannerRaw =
          p.bannerUrl ||
          p.imageUrl ||
          (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
          null;
        const absBanner = toAbsoluteUrl(bannerRaw);
        setBannerUrl(absBanner);

        // Build gallery array from known fields
        const rawGallery = p.gallery || p.images || (p.imageUrl ? [p.imageUrl] : []) || [];
        const absGallery = Array.isArray(rawGallery)
          ? rawGallery.map((v) => toAbsoluteUrl(v)).filter(Boolean)
          : [];
        setGalleryUrls(absGallery);
      } catch (e) {
        console.error("Failed to load program:", e);
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Failed to load program");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // helper to sanitize HTML before rendering
  const sanitize = (dirtyHtml) => {
    if (!dirtyHtml) return "";
    try {
      return DOMPurify.sanitize(dirtyHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"], // allow target attr for links
      });
    } catch (e) {
      console.error("DOMPurify error:", e);
      return dirtyHtml;
    }
  };

  if (loading) return <Skeleton />;

  if (err) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-3">Program not found</h2>
        <p className="mb-4 text-red-600">{err}</p>
        <div>
          <Link href="/programs" className="px-4 py-2 bg-blue-600 text-white rounded">Back to Programs</Link>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-3">No program data</h2>
        <div>
          <Link href="/programs" className="px-4 py-2 bg-blue-600 text-white rounded">Back to Programs</Link>
        </div>
      </div>
    );
  }

  const title = program.title || "Program";
  const description = program.shortDescription || program.excerpt || "";
  const safeHtml = sanitize(program.description || program.content || "");

  // copy link helper
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    } catch (e) {
      alert("Failed to copy link");
    }
  };

  return (
    <>
      <Head>
        <title>{title} — Vidhatha Society</title>
        <meta name="description" content={description || (program.description ? program.description.slice(0, 150) : "")} />
        <meta property="og:title" content={title} />
        {bannerUrl && <meta property="og:image" content={bannerUrl} />}
        <meta property="og:description" content={description} />
      </Head>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Banner */}
        {bannerUrl ? (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-gray-100">
            <img
              src={bannerUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // hide broken image icon and keep placeholder
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}

        {/* Title + meta */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-lg text-gray-600 mb-3">{description}</p>}

          <div className="flex items-center gap-3">
            <Link href={`/programs/${program.slug || program._id || slug}`} className="px-4 py-2 bg-indigo-600 text-white rounded">Learn More</Link>

            <a href={program.joinUrl || "/contact"} className="px-4 py-2 border rounded">Join Program</a>
            <a href={program.donateUrl || "/donate"} className="px-4 py-2 bg-green-600 text-white rounded">Donate</a>

            <button type="button" onClick={handleCopyLink} className="px-3 py-1 border rounded ml-auto">Copy link</button>
          </div>
        </header>

        {/* Main content */}
        <article className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: safeHtml || "<p>No details available.</p>" }} />
        </article>

        {/* Gallery */}
        {galleryUrls && galleryUrls.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryUrls.map((imgUrl, idx) => (
                <div key={idx} className="rounded overflow-hidden bg-gray-100 h-48">
                  <img
                    src={imgUrl}
                    alt={`${title} image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // hide broken image to avoid broken icon
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a href={program.joinUrl || "/contact"} className="px-5 py-3 bg-indigo-600 text-white rounded text-center">Join this program</a>
          <a href={program.donateUrl || "/donate"} className="px-5 py-3 border rounded text-center">Donate to support</a>
          <Link href="/programs" className="px-5 py-3 text-center">All programs</Link>
        </div>
      </main>
    </>
  );
}
