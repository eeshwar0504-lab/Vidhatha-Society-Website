import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Donate by Buying Services | Vidhatha Society",
  description: "Support our programs through service sponsorships.",
};

export default function DonateServicesPage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Donate by Purchasing Services</h1>
        <p className="max-w-2xl text-gray-700 leading-7 mt-2">
          Sponsor workshops, events, or CSR activities that directly impact communities.
        </p>
      </header>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Fund a Community Workshop</h2>
          <p className="text-gray-600 mt-2">
            Sponsor a skill development or awareness workshop.
          </p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Sponsor for ₹5,000
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">CSR Partnership</h2>
          <p className="text-gray-600 mt-2">
            Partner with us for long-term CSR initiatives that transform communities.
          </p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Contact Us
          </button>
        </div>
      </div>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
