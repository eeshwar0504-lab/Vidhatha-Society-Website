"use client";

import React, { useState } from "react";
import Link from "next/link";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "Vidhatha Society";
const ORG_LOGO = process.env.NEXT_PUBLIC_ORG_LOGO || undefined;

// Inject Razorpay script dynamically
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

// Create server order
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

export default function DonateServicesPage() {
  const [processing, setProcessing] = useState(false);

  async function startCheckout(amountRupees: number, title: string, description: string) {
    if (!RAZORPAY_KEY_ID) {
      alert("Razorpay is not configured.");
      return;
    }

    setProcessing(true);

    try {
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded || !(window as any).Razorpay) {
        alert("Payment gateway failed to load.");
        setProcessing(false);
        return;
      }

      const amountPaise = Math.round(amountRupees * 100);
      if (!amountPaise || amountPaise <= 0) {
        alert("Invalid amount");
        setProcessing(false);
        return;
      }

      // 1) Create order
      const order = await createOrderOnServer(amountPaise, {
        category: "Services",
        title,
        description,
      });

      // 2) Open Razorpay checkout
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
        handler: async function (response: any) {
          try {
            const verify = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                meta: { title, description, amount: order.amount },
              }),
            });

            const data = await verify.json();
            window.location.href = data?.redirect || "/donate/success";
          } catch (error) {
            console.error(error);
            window.location.href = "/donate/failed";
          } finally {
            setProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err?.message);
      console.error(err);
      setProcessing(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Donate by Purchasing Services</h1>
        <p className="max-w-2xl text-gray-700 leading-7 mt-2">
          Sponsor workshops, events, or service-based programs that directly uplift communities.
        </p>
      </header>

      <div className="space-y-6">

        {/* Service 1 — Razorpay Enabled */}
        <div className="p-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-semibold">Fund a Community Workshop</h2>
          <p className="text-gray-600 mt-2">
            Sponsor a large community workshop helping rural families learn new skills.
          </p>

          <button
            onClick={() =>
              startCheckout(
                5000,
                "Fund a Community Workshop",
                "Sponsorship for rural community workshop"
              )
            }
            disabled={processing}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {processing ? "Processing…" : "Sponsor for ₹5,000"}
          </button>
        </div>

      </div>

      <Link href="/donate" className="text-blue-600 underline">
        ← Back to Donate
      </Link>
    </main>
  );
}
