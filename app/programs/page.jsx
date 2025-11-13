"use client";

import React from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  {
    key: "social-welfare",
    title: "Social Welfare & Humanitarian Aid",
    desc: "Basic needs, dignity, and social care.",
    subs: [
      "Free Food Distribution",
      "Funeral Services",
      "Distributions and Donations",
      "Other Programs",
    ],
  },
  {
    key: "awareness-education",
    title: "Awareness & Education",
    desc: "Public awareness, education, and behaviour change.",
    subs: [
      "Awareness Programs",
      "Health Awareness Programs",
      "Environmental Protection Programs",
      "Culture, Art and Traditional Programs",
    ],
  },
  {
    key: "health-wellbeing",
    title: "Health & Well-being",
    desc: "Health-related and mental wellness initiatives.",
    subs: ["Health Programs", "Counselling Programs"],
  },
  {
    key: "senior-special",
    title: "Senior & Special Support",
    desc: "Support for elderly and differently-abled individuals.",
    subs: ["Senior Citizen Programs", "Disable People Programs"],
  },
  {
    key: "women-youth-child",
    title: "Women, Youth & Child Empowerment",
    desc: "Empowerment, protection, and personal development.",
    subs: ["Women & Child Welfare Programs", "Youth Programs", "Skill Development Programs"],
  },
  {
    key: "community-rural",
    title: "Community & Rural Development",
    desc: "Sustainable development and rural upliftment.",
    subs: ["Rural & Urban Development Programs", "Environmental Protection Programs"],
  },
  {
    key: "celebrations-cultural",
    title: "Celebrations & Cultural Integration",
    desc: "Bringing communities together through cultural unity.",
    subs: ["Special Day Celebrations", "Culture, Art and Traditional Programs"],
  },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProgramsPage() {
  const [active, setActive] = React.useState(CATEGORIES[0]?.key || null);
  const router = useRouter();

  function onCategoryToggle(key) {
    setActive((prev) => (prev === key ? null : key));
  }

  function onSubcategoryClick(sub) {
    const slug = slugify(sub);
    // navigate to program detail (create app/programs/[slug]/page.jsx later)
    router.push(`/programs/${slug}`);
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Our Programs</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Explore the categories below. Click a category to reveal its sub-programs, then click a sub-program to view details.
      </p>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const opened = active === cat.key;
          return (
            <section key={cat.key} className="border rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => onCategoryToggle(cat.key)}
                aria-expanded={opened}
                aria-controls={`cat-${cat.key}`}
                className="w-full flex items-center justify-between p-4 md:p-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">{cat.title}</h2>
                  {cat.desc && <p className="text-sm text-gray-600 mt-1">{cat.desc}</p>}
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${opened ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-700"}`}>
                    <svg className={`w-5 h-5 transform ${opened ? "rotate-180" : "rotate-0"} transition-transform`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l6 6a1 1 0 01-1.414 1.414L10 5.414 4.707 10.707A1 1 0 113.293 9.293l6-6A1 1 0 0110 3z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </button>

              <div
                id={`cat-${cat.key}`}
                className={`px-4 pb-5 md:px-6 transition-all ${opened ? "pt-0 max-h-[1000px]" : "max-h-0 overflow-hidden"}`}
                aria-hidden={!opened}
              >
                <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.subs.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => onSubcategoryClick(sub)}
                      className="text-left p-3 rounded-lg border hover:shadow-sm transition flex items-center justify-between bg-white"
                      aria-label={`Open ${sub}`}
                    >
                      <span className="text-sm text-gray-800">{sub}</span>
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
