// app/donate/books/BooksClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * BooksClient - Razorpay checkout integrated
 *
 * Requirements:
 * - NEXT_PUBLIC_RAZORPAY_KEY_ID set (client public key)
 * - Server endpoints:
 *    POST /api/order  -> creates order (expects amount in paise)
 *    POST /api/donations/verify      -> verifies signature and returns { redirect: "/donate/success" } or failure
 *
 * Do NOT import any server-side razorpay helpers here.
 */

const ANDROID_DOWNLOAD_URL = "/downloads/VidhathaApp.apk";


const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

async function loadRazorpaySdk(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((window as any).Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function createOrderOnServer(amountPaise: number, notes = {}) {
  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Order creation failed" }));
    throw new Error(err?.error || "Order creation failed");
  }
  return res.json();
}

export default function BooksClient() {
  const router = useRouter();
  const [loadingOrder, setLoadingOrder] = useState(false);

  const startCheckout = async (amountRupees: number, title: string, description: string) => {
    if (typeof window === "undefined") return;
    if (!RAZORPAY_KEY_ID) {
      alert("Payment is not configured (missing public key).");
      return;
    }

    setLoadingOrder(true);

    try {
      const sdkOk = await loadRazorpaySdk();
      if (!sdkOk || !(window as any).Razorpay) {
        alert("Payment SDK failed to load. Try again in a moment.");
        setLoadingOrder(false);
        return;
      }

      const amountPaise = Math.round(Number(amountRupees) * 100);
      if (!amountPaise || amountPaise <= 0) {
        alert("Invalid amount.");
        setLoadingOrder(false);
        return;
      }

      // 1) create order on server
      const order = await createOrderOnServer(amountPaise, {
        title,
        description,
        category: "Books",
      });

      // 2) open checkout
      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: process.env.NEXT_PUBLIC_ORG_NAME || "Vidhatha Society",
        description: `${title} — ${description}`,
        image: process.env.NEXT_PUBLIC_ORG_LOGO || undefined,
        order_id: order.id,
        notes: { title, description },
        theme: { color: "#D62828" },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout dismissed");
          },
        },
        handler: async function (response: any) {
          // 3) verify on server (server will verify signature using secret)
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                meta: { title, description, amount: order.amount },
              }),
            });
            const data = await verifyRes.json();
            if (data && data.redirect) {
              window.location.href = data.redirect;
            } else {
              window.location.href = "/donate/success";
            }
          } catch (err) {
            console.error("verification failed", err);
            window.location.href = "/donate/failed";
          } finally {
            setLoadingOrder(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("checkout error:", err);
      alert(err?.message || "Unable to start payment. Please try again.");
      setLoadingOrder(false);
    }
  };

  const handleBuy = (path: string, amountRupees?: number, title?: string, description?: string) => {
    // If path is a product page route, you might want to navigate there instead.
    // For direct checkout pass amount/title/description to startCheckout.
    if (amountRupees && title) {
      startCheckout(amountRupees, title, description || title);
    } else {
      router.push(path);
    }
  };

  const handleDownloadApk = () => {
    window.location.href = ANDROID_DOWNLOAD_URL;
  };

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Children Learning Pack</h2>
          <p className="text-gray-600 mt-2">Set of 3 workbooks designed for early learning development.</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              onClick={() => handleBuy("/donate/books/children-learning-pack", 300, "Children Learning Pack", "Set of 3 workbooks")}
              disabled={loadingOrder}
            >
              {loadingOrder ? "Processing…" : "Buy for ₹300"}
            </button>
            <Link href="/donate" className="text-sm text-blue-600 underline">
              ← Back to Donate
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Story Book Collection</h2>
          <p className="text-gray-600 mt-2">Inspiring stories to improve creativity and reading habits.</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              onClick={() => handleBuy("/donate/books/story-book-collection", 450, "Story Book Collection", "Set of inspiring storybooks")}
              disabled={loadingOrder}
            >
              {loadingOrder ? "Processing…" : "Buy for ₹450"}
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
              Download the Vidhatha Society app to browse donation items, track your donations, and get updates from the community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            

            <button onClick={handleDownloadApk} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:opacity-90">
              ⬇️ <span className="text-sm">Download APK</span>
            </button>

           
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 max-w-2xl">Note: APK install may require enabling “Unknown Sources.” Use Play Store for best experience.</p>
      </section>
    </>
  );
}
