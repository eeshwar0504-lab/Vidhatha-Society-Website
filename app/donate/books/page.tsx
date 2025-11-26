// app/donate/books/page.tsx
import React from "react";
import BooksClient from "./BooksClient";

export const metadata = {
  title: "Books Donation | Vidhatha Society",
  description: "Support education by purchasing books.",
};

export default function DonateBooksPage() {
  // Keep server-only logic here if needed in future (fetching static props, seo, etc.)
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Donate by Purchasing Books</h1>
        <p className="max-w-2xl text-gray-700 leading-7">
          Books purchased here will be donated to rural schools, learning centers, and children
          from low-income families.
        </p>
      </header>

      {/* Interactive UI lives in a client component */}
      <BooksClient />

      <footer className="mt-6 text-sm text-gray-600">
        <p>
          For download issues, contact{" "}
          <a href="mailto:vidhathasociety@gmail.com" className="underline text-blue-600">
            vidhathasociety@gmail.com
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
