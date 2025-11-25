import React from "react";
import Link from "next/link";
import Hero from "../components/hero";
import ProgramCard from "../components/ProgramCard";
import EventCard from "../components/EventCard";

import programsDataRaw from "../data/programs.json";
import eventsData from "../data/events.json";

// ========== Slugify ==========
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ========== Flatten Programs ==========
function getAllPrograms(data) {
  const all = [];
  data.categories.forEach((cat) => {
    cat.programs.forEach((p) => {
      if (typeof p === "string") {
        all.push({
          title: p,
          slug: slugify(p),
          short: "",
          description: "",
          images: [],
          categoryTitle: cat.title,
        });
      } else {
        all.push({
          ...p,
          slug: p.slug || slugify(p.title),
          categoryTitle: cat.title,
        });
      }
    });
  });
  return all;
}

export default function Home() {
  const allPrograms = getAllPrograms(programsDataRaw);
  const featuredPrograms = allPrograms.slice(0, 3);

  return (
    <div className="bg-gradient-to-b from-[#FFF8E1] via-white to-[#E3F2FD] min-h-screen">

      {/* HERO */}
      <Hero
        title="Vidhatha Society — Empowering Communities"
        subtitle="Youth-led initiatives, community service, and volunteer programs to create bright, lasting change."
        ctaText="Donate Now"
        ctaLink="/donate"
        secondaryCtaText="Join as a Volunteer"
        secondaryCtaLink="/volunteer"
        heroSrc="/hero.jpg"
      />

      {/* CONTENT */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        
        {/* PROGRAMS SECTION */}
        <section className="mt-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#F2C411] to-[#D62828]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D62828]">
                  Our programs
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Create impact with <span className="text-[#D62828]">Vidhatha</span>
              </h2>

              <p className="text-sm md:text-base text-gray-600 mt-1 max-w-xl">
                Explore the key initiatives that focus on education, women’s empowerment, and community development.
              </p>
            </div>

            {/* View all programs */}
            <Link
              href="/programs"
              className="
                group
                self-start md:self-auto inline-flex items-center gap-2
                text-sm font-semibold text-[#D62828]
                hover:text-[#B71D23] hover:underline underline-offset-4
                transition-colors duration-200
              "
            >
              <span>View all programs</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {featuredPrograms.map((p) => (
              <ProgramCard key={p.slug} program={p} />
            ))}
          </div>
        </section>

        {/* QUICK LINKS REMOVED */}

      </div>
    </div>
  );
}
