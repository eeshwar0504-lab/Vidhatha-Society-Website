import React from "react";
import Link from "next/link";

export default function ProgramCard({ program }) {
  if (!program) return null;

  const { title, slug, short, description, categoryTitle } = program;
  const summary = short || description || "";

  return (
    <Link
      href={`/programs/${slug}`}
      className="
        group relative overflow-hidden rounded-2xl bg-white
        border border-[#F2C41133] shadow-sm
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-200
      "
    >
      {/* Soft brand-colored hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFE082] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          {/* Category pill – soft yellow bg, red text */}
          <span className="inline-flex items-center rounded-full bg-[#FFF8E1] text-[#D62828] text-xs font-semibold px-3 py-1">
            {categoryTitle || "Program"}
          </span>

          {/* Learn more – brand red */}
          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-[#D62828] font-semibold">
            Learn more
            <span className="group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          {title}
        </h3>

        {summary && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {summary}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
          {/* Tag 1 – yellow border, red dot */}
          <span className="inline-flex items-center gap-1 bg-white/70 rounded-full px-2.5 py-1 border border-[#F2C41155]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D62828]" />
            Youth program
          </span>

          {/* Tag 2 – light blue border to bring in blue from letterhead */}
          <span className="inline-flex items-center gap-1 bg-white/70 rounded-full px-2.5 py-1 border border-[#1D3A8A22]">
            Community impact
          </span>
        </div>
      </div>
    </Link>
  );
}
