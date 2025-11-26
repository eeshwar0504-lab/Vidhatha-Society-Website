// app/donate/books/BooksClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Client component: put all event handlers, useState, window usage here.
 * Replace the download URL with real link when available.
 */

const ANDROID_DOWNLOAD_URL = "/downloads/VidhathaApp.apk"; // replace if you host APK

export default function BooksClient() {
  const router = useRouter();

  const handleBuy = (path: string) => {
    // Navigate to a product/donation detail or trigger checkout flow
    router.push(path);
  };

  const handleDownloadApk = () => {
    // direct link download (may open in same tab)
    window.location.href = ANDROID_DOWNLOAD_URL;
  };

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Children Learning Pack</h2>
          <p className="text-gray-600 mt-2">
            Set of 3 workbooks designed for early learning development.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleBuy("/donate/books/children-learning-pack")}
            >
              Buy for ₹300
            </button>
            <Link href="/donate" className="text-sm text-blue-600 underline">
              ← Back to Donate
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Story Book Collection</h2>
          <p className="text-gray-600 mt-2">
            Inspiring stories to improve creativity and reading habits.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleBuy("/donate/books/story-book-collection")}
            >
              Buy for ₹450
            </button>
            <Link href="/donate" className="text-sm text-blue-600 underline">
              ← Back to Donate
            </Link>
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="mt-6 p-6 border rounded-lg shadow bg-white">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Get our App</h3>
            <p className="text-gray-600 mt-1 max-w-xl">
              Download the Vidhatha Society app to browse donation items, track your donations,
              and get updates from the community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ Only one button: Download APK */}
            <button
              onClick={handleDownloadApk}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              ⬇️ <span>Download APK</span>
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 max-w-2xl">
          Note: APK install may require enabling “Install from unknown sources” in your Android
          settings.
        </p>
      </section>
    </>
  );
}
