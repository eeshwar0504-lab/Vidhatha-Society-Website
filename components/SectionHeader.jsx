import React from "react";

export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
}) {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} gap-2 mb-8`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#F2C411] via-[#D62828] to-[#1D3A8A]" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D3A8A]">
            {eyebrow}
          </span>
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
        {title}{" "}
        {highlight && <span className="text-[#D62828]">{highlight}</span>}
      </h1>

      {description && (
        <p className="text-sm md:text-base text-gray-600 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
