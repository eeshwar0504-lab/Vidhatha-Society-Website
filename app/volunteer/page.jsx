"use client";

import React from "react";
import VolunteerForm from "../../components/VolunteerForm";
import PageShell from "../../components/PageShell";
import SectionHeader from "../../components/SectionHeader";

export default function Volunteer() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Volunteer"
        title="Become a"
        highlight="Vidhatha volunteer"
        description="Join our community of changemakers and support education, women’s empowerment, health and welfare programs."
        align="center"
      />

      {/* Why volunteer */}
      <section className="max-w-5xl mx-auto mb-10">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Create impact",
              body: "Directly contribute to positive change in your community through on-ground programs.",
            },
            {
              title: "Build community",
              body: "Connect with passionate individuals working toward common goals.",
            },
            {
              title: "Gain experience",
              body: "Develop skills in organisation, communication, outreach and leadership.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="
                rounded-2xl bg-white border border-[#F2C41133]
                p-5 text-center shadow-sm
                hover:-translate-y-1 hover:shadow-xl
                transition-all duration-200
              "
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-700">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Volunteer opportunities */}
      <section className="max-w-5xl mx-auto mb-10">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Volunteer opportunities
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Choose a role that matches your skills and availability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Program support",
              desc: "Help run community programs and workshops.",
              meta: ["Time: 4–8 hours/week", "Location: Community centers"],
            },
            {
              title: "Event coordination",
              desc: "Assist in planning and executing community events.",
              meta: ["Time: Flexible", "Location: Various"],
            },
            {
              title: "Fundraising",
              desc: "Support campaigns and initiatives to raise funds.",
              meta: ["Time: 3–5 hours/week", "Location: Remote / Field"],
            },
            {
              title: "Communications",
              desc: "Support social media, content, and outreach efforts.",
              meta: ["Time: 2–4 hours/week", "Location: Remote"],
            },
          ].map((card) => (
            <div
              key={card.title}
              className="
                bg-white p-5 rounded-2xl shadow-sm border border-[#F2C41133]
                hover:-translate-y-1 hover:shadow-xl
                transition-all duration-200
              "
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-700 mb-3">{card.desc}</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {card.meta.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Apply to volunteer
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Fill out the form below and we&apos;ll get in touch with you soon.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#F2C41133] shadow-sm p-5 md:p-6">
          <VolunteerForm />
        </div>
      </section>
    </PageShell>
  );
}
