import React from "react";
import Link from "next/link";

export default function EventCard({ event }) {
  if (!event) return null;

  const { title, slug, date, location, summary, description } = event;

  const text = summary || description || "";

  return (
    <Link
      href={`/events/${slug}`}
      className="
        group relative overflow-hidden rounded-2xl bg-white
        border border-sky-100 shadow-sm
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-200
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-cyan-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1">
            Upcoming Event
          </span>
          {date && (
            <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide">
              {date}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          {title}
        </h3>

        {text && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {text}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{location || "Community Location"}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-sky-600 font-medium">
            View details
            <span className="group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
