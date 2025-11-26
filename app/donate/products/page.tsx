// app/donate/products/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Products donation page with Razorpay integration (client-side)
 *
 * Requirements:
 *  - NEXT_PUBLIC_RAZORPAY_KEY_ID must be set (public key).
 *  - Server endpoints:
 *     POST /api/order   (create order using server secret)
 *     POST /api/donations/verify       (verify signature using server secret)
 *
 * Do NOT import any server-side razorpay helpers in this file.
 */

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "Vidhatha Society";
const ORG_LOGO = process.env.NEXT_PUBLIC_ORG_LOGO || undefined;

async function loadRazorpaySdk(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((window as any).Razorpay) return true;
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
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

export default function DonateProductsPage() {
  const [processing, setProcessing] = useState(false);

  async function startCheckout(amountRupees: number, title: string, description: string) {
    if (typeof window === "undefined") return;
    if (!RAZORPAY_KEY_ID) {
      alert("Payment is not configured (missing public key). Contact admin.");
      return;
    }

    setProcessing(true);

    try {
      const sdkOk = await loadRazorpaySdk();
      if (!sdkOk || !(window as any).Razorpay) {
        alert("Payment SDK failed to load. Try again in a moment.");
        setProcessing(false);
        return;
      }

      const amountPaise = Math.round(Number(amountRupees) * 100);
      if (!amountPaise || amountPaise <= 0) {
        alert("Invalid amount.");
        setProcessing(false);
        return;
      }

      // create order on server
      const order = await createOrderOnServer(amountPaise, { title, description, category: "Products" });

      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: ORG_NAME,
        description: `${title} — ${description}`,
        image: ORG_LOGO,
        order_id: order.id,
        notes: { title, description },
        theme: { color: "#D62828" },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout dismissed");
          },
        },
        handler: async function (response: any) {
          // verify on server
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
            setProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("checkout error:", err);
      alert(err?.message || "Unable to start payment. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Donate by Purchasing Products</h1>
        <p className="max-w-2xl text-gray-700 leading-7 mt-2">
          Beautiful handcrafted items made by local women and artisans. Your purchase supports livelihoods and community development.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Handmade Tote Bag</h2>
          <p className="text-gray-600 mt-2">Eco-friendly and made by women self-help groups.</p>
          <button
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            onClick={() => startCheckout(499, "Handmade Tote Bag", "Eco-friendly tote supporting artisans")}
            disabled={processing}
          >
            {processing ? "Processing…" : "Buy for ₹499"}
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Art Print</h2>
          <p className="text-gray-600 mt-2">Support local artists while contributing to social causes.</p>
          <button
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            onClick={() => startCheckout(799, "Art Print", "Limited edition art print supporting artists")}
            disabled={processing}
          >
            {processing ? "Processing…" : "Buy for ₹799"}
          </button>
        </div>
      </div>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
