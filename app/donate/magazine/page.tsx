import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Magazine Donations | Vidhatha Society",
  description: "Support our cause by purchasing magazines.",
};

export default function MagazineDonatePage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Donate by Purchasing Magazines</h1>
        <p className="max-w-2xl text-gray-700 leading-7">
          Every magazine purchase supports education, women empowerment, community health,
          and rural development programs.
        </p>
      </header>

      <section className="space-y-4">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Monthly Impact Magazine</h2>
          <p className="text-gray-600 mt-2">
            A beautifully designed magazine containing impact stories, project updates,
            interviews, and community highlights.
          </p>

          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹150
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Special Edition – Education & Growth</h2>
          <p className="text-gray-600 mt-2">
            Deep insights into our educational programs and the lives we touch.
          </p>

          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹250
          </button>
        </div>
      </section>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
