import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  heroSrc = "/hero.jpg",
}) {
  return (
    <section className="relative w-full h-[620px] md:h-[680px] overflow-hidden">
      {/* Background image */}
      <Image
        src={heroSrc}
        alt="Vidhatha Society hero"
        fill
        priority
        className="object-cover"
      />

      {/* Transparent dark shading instead of color tint */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
          <div
            className="
              inline-flex items-center gap-2 rounded-full
              bg-white/20 border border-white/40 px-4 py-1
              text-xs md:text-sm text-white mb-5
              shadow-sm backdrop-blur-sm
            "
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-[#2E8B57] animate-pulse" />
            Youth. Community. Change.
          </div>

          <h1
            className="
              text-4xl md:text-5xl lg:text-6xl font-extrabold
              text-white tracking-tight drop-shadow-lg
            "
          >
            {title}
          </h1>

          <p className="mt-5 text-lg md:text-xl lg:text-2xl text-gray-100 max-w-2xl leading-relaxed drop-shadow">
            {subtitle}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={ctaLink || "/donate"}
              className="
                px-8 py-3 rounded-2xl text-base md:text-lg font-semibold
                bg-[#F2C411] text-black
                shadow-lg shadow-yellow-400/30
                hover:bg-[#E5B200] hover:-translate-y-0.5
                active:translate-y-0
                transition
              "
            >
              {ctaText}
            </Link>

            {secondaryCtaText && (
              <Link
                href={secondaryCtaLink || "/volunteer"}
                className="
                  px-8 py-3 rounded-2xl text-base md:text-lg font-semibold
                  bg-[#D62828] text-white
                  hover:bg-[#B81D1F] hover:-translate-y-0.5
                  transition shadow-lg shadow-red-500/30
                "
              >
                {secondaryCtaText} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
