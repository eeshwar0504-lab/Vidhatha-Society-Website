import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Donate by Buying Products | Vidhatha Society",
  description: "Support our programs by purchasing products.",
};

export default function DonateProductsPage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Donate by Purchasing Products</h1>
        <p className="max-w-2xl text-gray-700 leading-7 mt-2">
          Beautiful handcrafted items made by local women and artisans. Your purchase supports
          livelihoods and community development.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Handmade Tote Bag</h2>
          <p className="text-gray-600 mt-2">Eco-friendly and made by women self-help groups.</p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹499
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Art Print</h2>
          <p className="text-gray-600 mt-2">Support local artists while contributing to social causes.</p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹799
          </button>
        </div>
      </div>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
