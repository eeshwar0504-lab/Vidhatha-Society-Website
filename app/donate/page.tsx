import React from "react";
import Script from "next/script";
import DonationCategories from "../../components/DonationCategories";

export const metadata = {
  title: "Donate | Vidhatha Society",
  description: "Choose a cause and amount to support our programs.",
};

export default function DonatePage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Donate</h1>
        <p className="max-w-2xl leading-7 text-gray-700">
          Select a category to see sub-categories and suggested amounts. You can also choose a custom amount.
        </p>
      </header>
      <DonationCategories />
      <p className="text-sm text-gray-500">
        Donations are tax-deductible as per applicable laws. For bank transfer or CSR enquiries, write to{" "}
        <a href="mailto:hello@vidhatha.org" className="underline">hello@vidhatha.org</a>.
      </p>
    </main>
  );
}
