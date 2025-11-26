// app/donate/magazine/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * MagazineDonatePage (client)
 *
 * This page integrates Razorpay checkout:
 * - Expects server endpoints:
 *   POST /api/order   (amount in paise)
 *   POST /api/donations/verify       (verifies razorpay_signature)
 *
 * - Expects NEXT_PUBLIC_RAZORPAY_KEY_ID (client public key) in env
 * - Do NOT import any server-only razorpay helper here
 */

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

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

export default function MagazineDonatePage() {
  const [processing, setProcessing] = useState(false);

  async function startCheckout(amountRupees: number, title: string, description: string) {
    if (typeof window === "undefined") return;
    if (!RAZORPAY_KEY_ID) {
      alert("Payment not configured (missing public key). Contact admin.");
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

      // 1) Create order on server
      const order = await createOrderOnServer(amountPaise, {
        title,
        description,
        category: "Magazine",
      });

      // 2) Open Razorpay checkout
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
          // 3) Verify on server
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
      console.error("checkout error", err);
      alert(err?.message || "Unable to initiate payment. Try again.");
      setProcessing(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Donate by Purchasing Magazines</h1>
        <p className="max-w-2xl text-gray-700 leading-7">
          Every magazine purchase supports education, women empowerment, community health, and rural development programs.
        </p>
      </header>

      <section className="space-y-4">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Monthly Impact Magazine</h2>
          <p className="text-gray-600 mt-2">
            A beautifully designed magazine containing impact stories, project updates, interviews, and community highlights.
          </p>

          <button
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            onClick={() => startCheckout(150, "Monthly Impact Magazine", "Monthly magazine supporting Vidhatha programs")}
            disabled={processing}
          >
            {processing ? "Processing…" : "Buy for ₹150"}
          </button>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Special Edition – Education & Growth</h2>
          <p className="text-gray-600 mt-2">
            Deep insights into our educational programs and the lives we touch.
          </p>

          <button
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            onClick={() => startCheckout(250, "Special Edition – Education & Growth", "Special edition magazine supporting education programs")}
            disabled={processing}
          >
            {processing ? "Processing…" : "Buy for ₹250"}
          </button>
        </div>
      </section>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
