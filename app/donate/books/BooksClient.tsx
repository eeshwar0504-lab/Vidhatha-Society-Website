// app/donate/books/BooksClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Client component: put all event handlers, useState, window usage here.
 * Replace the download URLs with real links when available.
 */

const ANDROID_DOWNLOAD_URL = "/downloads/VidhathaApp.apk"; // replace if you host APK
const IOS_DOWNLOAD_URL = "https://apps.apple.com/app/your-app-id"; // replace with real AppStore link
const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=your.package.name"; // replace with real PlayStore link

export default function BooksClient() {
  const router = useRouter();

  const handleBuy = (path: string) => {
    // Navigate to a product/donation detail or trigger checkout flow
    // If you prefer client-side nav: router.push(path)
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={PLAYSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:opacity-90"
            >
              📱 <span className="text-sm">Play Store</span>
            </a>

            <button
              onClick={handleDownloadApk}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:opacity-90"
            >
              ⬇️ <span className="text-sm">Download APK</span>
            </button>

            <a
              href={IOS_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded hover:opacity-90"
            >
               <span className="text-sm">App Store</span>
            </a>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 max-w-2xl">
          Note: APK install may require enabling “Unknown Sources.” Use Play Store for best experience.
        </p>
      </section>
    </>
  );
}
