import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Books Donation | Vidhatha Society",
  description: "Support education by purchasing books.",
};

export default function DonateBooksPage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Donate by Purchasing Books</h1>
        <p className="max-w-2xl text-gray-700 leading-7">
          Books purchased here will be donated to rural schools, learning centers, and children
          from low-income families.
        </p>
      </header>

      <section className="space-y-4">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Children Learning Pack</h2>
          <p className="text-gray-600 mt-2">
            Set of 3 workbooks designed for early learning development.
          </p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹300
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Story Book Collection</h2>
          <p className="text-gray-600 mt-2">
            Inspiring stories to improve creativity and reading habits.
          </p>
          <button className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Buy for ₹450
          </button>
        </div>
      </section>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
