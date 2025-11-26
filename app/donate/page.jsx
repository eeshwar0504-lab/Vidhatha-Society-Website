// @ts-nocheck
"use client";

import React, { useState } from "react";
import Script from "next/script";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

// ---------- Donation data ----------
const donationCategories = {
  food: {
    key: "food",
    icon: "🍛",
    title: "Food & Hunger Relief",
    subtitle: "Top ways to share a nourishing meal",
    options: [
      {
        amount: 100,
        description: "Feed a person (free meal service / Anna Daanam)",
      },
      {
        amount: 500,
        description: "Provide grocery kit for a poor family",
      },
      {
        amount: 1000,
        description: "Sponsor a community kitchen for a day",
      },
      {
        amount: 1500,
        description: "Nutrition pack for children / elderly",
      },
      {
        amount: 2000,
        description: "Special festival meal donation",
      },
    ],
  },
  animal: {
    key: "animal",
    icon: "🐄",
    title: "Animal Care & Kindness",
    subtitle: "Compassion for voiceless beings",
    options: [
      { amount: 200, description: "Feed a cow" },
      { amount: 200, description: "Feed a street dog" },
      { amount: 200, description: "Feed monkeys / temple animals" },
      { amount: 150, description: "Feed birds (grains / water bowls)" },
      { amount: 1000, description: "Sponsor medical care for stray animals" },
    ],
  },
  environment: {
    key: "environment",
    icon: "🌳",
    title: "Environment & Sustainability",
    subtitle: "Support a greener, cleaner planet",
    options: [
      { amount: 200, description: "Plant and maintain a tree" },
      { amount: 500, description: "Sponsor community tree plantation drive" },
      {
        amount: 500,
        description: "Support plastic usage reduction awareness",
      },
      {
        amount: 1000,
        description: "Rainwater harvesting / waste segregation project",
      },
      { amount: 800, description: "Support organic farming awareness" },
    ],
  },
  farmers: {
    key: "farmers",
    icon: "👩‍🌾",
    title: "Farmer Support & Rural Growth",
    subtitle: "Strengthening those who feed the nation",
    options: [
      { amount: 300, description: "Distribute seed packets to farmers" },
      {
        amount: 1000,
        description: "Sponsor farmer training on natural farming",
      },
      { amount: 1500, description: "Donate irrigation / tool kits" },
      { amount: 500, description: "Sponsor rural solar lamp" },
    ],
  },
  women: {
    key: "women",
    icon: "👩‍🧵",
    title: "Women Empowerment",
    subtitle: "Invest in skills, dignity, and independence",
    options: [
      { amount: 1000, description: "Donate a sewing machine to a woman" },
      { amount: 800, description: "Sponsor skill development training" },
      {
        amount: 500,
        description: "Awareness program for women rights & safety",
      },
      {
        amount: 400,
        description: "Menstrual hygiene awareness & sanitary pad kits",
      },
      {
        amount: 1500,
        description: "Support small business startup kit for women",
      },
    ],
  },
  health: {
    key: "health",
    icon: "🧘",
    title: "Health & Mind Wellness",
    subtitle: "Care for body, mind, and spirit",
    options: [
      { amount: 500, description: "Health check-up camp support" },
      {
        amount: 1000,
        description: "Sponsor yoga / mind management workshop",
      },
      {
        amount: 800,
        description: "Awareness program for health and fitness",
      },
      {
        amount: 1500,
        description: "Donate medicines / first-aid kits to poor patients",
      },
    ],
  },
  education: {
    key: "education",
    icon: "📚",
    title: "Education & Literacy",
    subtitle: "Light a lamp of knowledge",
    options: [
      { amount: 100, description: "Purchase a book for poor students" },
      {
        amount: 300,
        description:
          "Purchase NGO magazine for knowledge sharing & govt schemes",
      },
      {
        amount: 1000,
        description: "Donate for free library maintenance",
      },
      {
        amount: 1180,
        description: "Donate Social Responsibility in India book",
      },
      {
        amount: 500,
        description: "Donate stationery / school kit for children",
      },
      {
        amount: 2000,
        description:
          "Sponsor education for a student (books, fees, uniforms)",
      },
    ],
  },
  spiritual: {
    key: "spiritual",
    icon: "🙏",
    title: "Spiritual & Cultural Service",
    subtitle: "Nurturing values and inner peace",
    options: [
      { amount: 500, description: "Temple or community cleanliness drive" },
      { amount: 800, description: "Distribute holy books / bhajan kits" },
      {
        amount: 1000,
        description: "Support meditation & spiritual awareness camps",
      },
      {
        amount: 500,
        description: "Sponsor cultural / moral education for children",
      },
    ],
  },
  general: {
    key: "general",
    icon: "🌍",
    title: "General Social Service",
    subtitle: "Support people in vulnerable situations",
    options: [
      { amount: 200, description: "Donate blanket or clothing" },
      { amount: 1000, description: "Sponsor wheelchair / tricycle for disabled" },
      { amount: 500, description: "Conduct cleanliness (Swachhata) drive" },
      {
        amount: 800,
        description: "Support old age home or orphanage needs",
      },
    ],
  },
  special: {
    key: "special",
    icon: "💧",
    title: "Special Purpose Donations",
    subtitle: "Support focused, high-impact projects",
    options: [
      {
        amount: 500,
        description: "Support rainwater harvesting / rural sanitation",
      },
      {
        amount: 1000,
        description: "Help install a community drinking water unit",
      },
      {
        amount: 500,
        description: "Donate dustbins / cloth bags for “No Plastic” mission",
      },
    ],
  },
};

const categoryOrder = [
  "food",
  "animal",
  "environment",
  "farmers",
  "women",
  "health",
  "education",
  "spiritual",
  "general",
  "special",
];

function formatAmount(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function DonationPage() {
  const [activeKey, setActiveKey] = useState("food");
  const [customAmounts, setCustomAmounts] = useState({});

  const handleToggleCategory = (key) => {
    setActiveKey((prev) => (prev === key ? null : key));
  };

  // ---------- Razorpay helper ----------
  const openRazorpayCheckout = async (amount, description, categoryTitle) => {
    if (typeof window === "undefined") return;

    if (!RAZORPAY_KEY_ID) {
      alert("Razorpay key is not configured.");
      return;
    }

    // Amount in paise
    const amountInPaise = Math.round(Number(amount) * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      alert("Invalid amount.");
      return;
    }

    // Optionally create an order on your backend
    let orderId;
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          notes: {
            category: categoryTitle,
            description,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        orderId = data.id || data.orderId;
      }
    } catch (e) {
      console.error("Order creation failed, falling back to direct checkout:", e);
    }

    if (!window.Razorpay) {
      alert("Payment SDK not loaded yet. Please try again in a moment.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      name: "Vidhatha Society",
      description: `${categoryTitle} – ${description}`,
      order_id: orderId,
      theme: { color: "#4CAF50" },
      handler: function (response) {
        alert(
          `Thank you! Payment successful.\n\nPayment ID: ${response.razorpay_payment_id}`
        );
      },
      modal: {
        ondismiss: function () {
          console.log("Payment popup closed.");
        },
      },
      notes: {
        category: categoryTitle,
        description,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleDonate = (amount, description, categoryTitle) => {
    openRazorpayCheckout(amount, description, categoryTitle);
  };

  const handleCustomDonate = (key, categoryTitle) => {
    const raw = customAmounts[key];
    const num = raw ? Number(raw) : NaN;
    if (!num || num <= 0) {
      alert("Please enter a valid custom donation amount.");
      return;
    }
    openRazorpayCheckout(num, "Custom donation", categoryTitle);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* Tagline */}
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-[#F2C411] via-[#D62828] to-[#1D3A8A] shadow-sm shadow-[#D62828]/30 text-[11px] font-semibold tracking-[0.18em] text-white uppercase mb-5">
          Service to Human is Service to God
        </div>

        {/* Heading */}
        <header className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
            Service Through Donation{" "}
            <span className="text-[#D62828]">— Choose Your Cause</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-700 max-w-2xl">
            You may donate any amount — every rupee helps create a ripple of
            positive change. Select a category below to see how you can
            contribute.
          </p>
        </header>

        {/* Categories row/columns */}
        <section className="mt-8 flex flex-wrap gap-6 items-start">
          {categoryOrder.map((key) => {
            const category = donationCategories[key];
            const isActive = activeKey === key;

            return (
              <div
                key={key}
                className={`w-full md:w-[48%] xl:w-[31.5%] transition-all duration-300 ease-out rounded-3xl border bg-white/80 backdrop-blur-sm shadow-sm ${
                  isActive
                    ? "border-[#F2C411]/80 shadow-lg shadow-[#F2C411]/30 scale-[1.01]"
                    : "border-slate-200 hover:border-[#F2C411]/60 hover:shadow-md"
                }`}
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => handleToggleCategory(key)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4"
                  aria-expanded={isActive}
                  aria-controls={`donation-panel-${key}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFF4C2] via-[#FFE3C2] to-[#FFD1D1] flex items-center justify-center text-lg shadow-sm">
                      <span>{category.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-sm md:text-[15px] font-semibold text-slate-900">
                        {category.title}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Tap to view suggested donations
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-xs text-slate-500 bg-white transition-transform duration-200 ${
                      isActive ? "rotate-180 bg-[#FFF4C2]/80" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span>↓</span>
                  </div>
                </button>

                {/* Content – only rendered for active card */}
                {isActive && (
                  <div
                    id={`donation-panel-${key}`}
                    className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4"
                  >
                    <p className="text-[11px] text-slate-500">
                      Choose a suggested amount or enter a custom donation for
                      this cause.
                    </p>

                    {/* Donation options grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {category.options.map((option, idx) => (
                        <div
                          key={`${key}-${idx}`}
                          className="rounded-2xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)] px-4 py-3 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-lg font-extrabold text-[#1D3A8A] leading-tight">
                                {formatAmount(option.amount)}
                              </div>
                              <p className="text-[12px] mt-1 text-slate-700">
                                {option.description}
                              </p>
                            </div>
                            <span className="mt-1 inline-flex items-center rounded-full bg-[#FFF4C2] text-[10px] font-semibold text-[#B66A00] px-2 py-0.5">
                              Fixed
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDonate(
                                option.amount,
                                option.description,
                                category.title
                              )
                            }
                            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#F2C411] via-[#F88C3A] to-[#D62828] px-3 py-2 text-[12px] font-semibold text-white shadow-md shadow-[#F88C3A]/40 hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition"
                            aria-label={`Donate ${formatAmount(
                              option.amount
                            )} for ${option.description}`}
                          >
                            Donate Now →
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Custom donation */}
                    <div className="mt-4 rounded-2xl border border-dashed border-[#F2C411]/70 bg-[#FFFCF2] px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-800 mb-2">
                        Or enter a custom amount
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            className="w-full rounded-full border border-[#F2C411]/60 bg-white px-6 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F2C411]/70 focus:border-[#F2C411]"
                            placeholder="Enter any amount"
                            value={customAmounts[key] || ""}
                            onChange={(e) =>
                              setCustomAmounts((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            aria-label={`Custom donation amount for ${category.title}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCustomDonate(key, category.title)}
                          className="rounded-full bg-gradient-to-r from-[#F2C411] via-[#F88C3A] to-[#D62828] px-4 py-2 text-[12px] font-semibold text-white shadow-md shadow-[#F88C3A]/40 hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition"
                        >
                          Donate Custom
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Every rupee matters — thank you for sharing your
                        kindness.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
