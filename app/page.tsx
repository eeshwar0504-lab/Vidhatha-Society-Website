import React from "react";
import Link from "next/link";
import Hero from "../components/Hero";
import ProgramCard from "../components/ProgramCard";
import EventCard from "../components/EventCard";
import programsDataRaw from "../data/programs.json";
import eventsData from "../data/events.json";

import { ProgramObj, Category, ProgramsFile } from "../types/programs.d";

// 1) cast JSON to our TS type
const programsData = programsDataRaw as unknown as ProgramsFile;

// 2) slugify with explicit param + return types
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 3) flatten programs with types
function getAllPrograms(data: ProgramsFile): ProgramObj[] {
  const allPrograms: ProgramObj[] = [];

  data.categories.forEach((cat: Category) => {
    cat.programs.forEach((p) => {
      if (typeof p === "string") {
        allPrograms.push({
          title: p,
          slug: slugify(p),
          short: "",
          description: "",
          images: [],
          donation_target: undefined,
          categoryTitle: cat.title,
        });
      } else {
        allPrograms.push({
          ...p,
          slug: p.slug || slugify(p.title),
          categoryTitle: cat.title,
        });
      }
    });
  });

  return allPrograms;
}

export default function Home() {
  const allPrograms: ProgramObj[] = getAllPrograms(programsData);
  const featuredPrograms = allPrograms.slice(0, 3);

  const featuredEvents = Array.isArray(eventsData) ? eventsData.slice(0, 3) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <Hero
        title="Vidhatha Society — Empowering Communities"
        subtitle="Programs, events and volunteer opportunities to create lasting change."
        ctaText="Donate"
        ctaLink="/donate"
        secondaryCtaText="Volunteer"
        secondaryCtaLink="/volunteer"
      />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Our Programs</h2>
          <Link href="/programs" className="text-primary-600 font-semibold">
            View all
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPrograms.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link href="/events" className="text-primary-600 font-semibold">
            View all
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link href="/blog" className="text-primary-600 font-semibold mr-4">
          Blog
        </Link>
        <Link href="/gallery" className="text-primary-600 font-semibold mr-4">
          Gallery
        </Link>
        <Link href="/contact" className="text-primary-600 font-semibold">
          Contact
        </Link>
      </section>
    </div>
  );
}
