"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import api from "@/lib/api";
import Link from "next/link";
import DOMPurify from "dompurify";
import PageShell from "../../../components/PageShell";
import SectionHeader from "../../../components/SectionHeader";

/* Skeleton with new UI shell */
function Skeleton() {
  return (
    <PageShell>
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-56 bg-gray-200 rounded-2xl" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </PageShell>
  );
}

/* Helper: build absolute URL for images returned by backend. */
function toAbsoluteUrl(val) {
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;

  const base = api.defaults?.baseURL || "";
  if (!base) return val;

  if (val.startsWith("/")) {
    return `${base}${val.startsWith("/") ? "" : "/"}${val}`;
  }
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

        const bannerRaw =
          p.bannerUrl ||
          p.imageUrl ||
          (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
          null;
        setBannerUrl(toAbsoluteUrl(bannerRaw));

        const rawGallery =
          p.gallery ||
          p.images ||
          (p.imageUrl ? [p.imageUrl] : []) ||
          [];
        const absGallery = Array.isArray(rawGallery)
          ? rawGallery.map((v) => toAbsoluteUrl(v)).filter(Boolean)
          : [];
        setGalleryUrls(absGallery);
      } catch (e) {
        console.error("Failed to load program:", e);
        if (mounted)
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load program"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const sanitize = (dirtyHtml) => {
    if (!dirtyHtml) return "";
    try {
      return DOMPurify.sanitize(dirtyHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"],
      });
    } catch (e) {
      console.error("DOMPurify error:", e);
      return dirtyHtml;
    }
  };

  if (loading) return <Skeleton />;

  if (err) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-3">Program not found</h2>
          <p className="mb-4 text-red-600">{err}</p>
          <Link
            href="/programs"
            className="inline-flex px-4 py-2 rounded-2xl bg-[#1D3A8A] text-white text-sm font-semibold"
          >
            Back to Programs
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!program) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-3">No program data</h2>
          <Link
            href="/programs"
            className="inline-flex px-4 py-2 rounded-2xl bg-[#1D3A8A] text-white text-sm font-semibold"
          >
            Back to Programs
          </Link>
        </div>
      </PageShell>
    );
  }

  const title = program.title || "Program";
  const description = program.shortDescription || program.excerpt || "";
  const safeHtml = sanitize(program.description || program.content || "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <>
      <Head>
        <title>{title} — Vidhatha Society</title>
        <meta
          name="description"
          content={
            description ||
            (program.description ? program.description.slice(0, 150) : "")
          }
        />
        <meta property="og:title" content={title} />
        {bannerUrl && <meta property="og:image" content={bannerUrl} />}
        <meta property="og:description" content={description} />
      </Head>

      <PageShell>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="Program"
            title={title}
            highlight=""
            description={description}
          />

          {/* Banner */}
          {bannerUrl && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 bg-gray-100 shadow-sm">
              <img
                src={bannerUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <a
              href={program.joinUrl || "/contact"}
              className="
                inline-flex px-5 py-2.5 rounded-2xl bg-[#1D3A8A] text-white text-sm font-semibold
                shadow-md shadow-[#1D3A8A]/30 hover:-translate-y-0.5 transition
              "
            >
              Join this program
            </a>
            <a
              href={program.donateUrl || "/donate"}
              className="
                inline-flex px-5 py-2.5 rounded-2xl bg-[#D62828] text-white text-sm font-semibold
                shadow-md shadow-[#D62828]/30 hover:-translate-y-0.5 transition
              "
            >
              Donate to support
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="
                inline-flex px-4 py-2 rounded-2xl border border-gray-300 text-sm
                hover:bg-gray-50 transition ml-auto
              "
            >
              Copy link
            </button>
          </div>

          {/* Main content */}
          <article className="rounded-2xl bg-white border border-[#F2C41133] shadow-sm p-5 md:p-6">
            <div
              className="prose max-w-none prose-p:text-gray-700 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{
                __html: safeHtml || "<p>No details available.</p>",
              }}
            />
          </article>

          {/* Gallery */}
          {galleryUrls && galleryUrls.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryUrls.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden bg-gray-100 h-40 shadow-sm"
                  >
                    <img
                      src={imgUrl}
                      alt={`${title} image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10">
            <Link
              href="/programs"
              className="inline-flex px-5 py-2.5 rounded-2xl border text-sm hover:bg-gray-50"
            >
              ← Back to all programs
            </Link>
          </div>
        </div>
      </PageShell>
    </>
  );
}
