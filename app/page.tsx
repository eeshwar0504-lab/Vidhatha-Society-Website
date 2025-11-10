import React from "react";
import Link from "next/link";
import Hero from "../components/Hero";
import ProgramCard from "../components/ProgramCard";
import EventCard from "../components/EventCard";
import programsData from "../data/programs.json";
import eventsData from "../data/events.json";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Hero
        title={"Vidhatha Society — Empowering Communities"}
        subtitle={"Programs, events and volunteer opportunities to create lasting change."}
        ctaText={"Donate"}
        ctaLink={"/donate"}
        secondaryCtaText={"Volunteer"}
        secondaryCtaLink={"/volunteer"}
      />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Our Programs</h2>
          <Link href="/programs" className="text-primary-600 font-semibold">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programsData.slice(0, 3).map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link href="/events" className="text-primary-600 font-semibold">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsData.slice(0, 3).map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link href="/blog" className="text-primary-600 font-semibold mr-4">Blog</Link>
        <Link href="/gallery" className="text-primary-600 font-semibold mr-4">Gallery</Link>
        <Link href="/contact" className="text-primary-600 font-semibold">Contact</Link>
      </section>
    </div>
  );
}
