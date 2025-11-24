import React from "react";
import Script from "next/script";
import DonationCategories from "../../components/DonationCategories";
import PageShell from "../../components/PageShell";
import SectionHeader from "../../components/SectionHeader";

export const metadata = {
  title: "Donate | Vidhatha Society",
  description: "Choose a cause and amount to support our programs.",
};

const DonatePage = () => {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <PageShell>
        <SectionHeader
          eyebrow="Donate"
          title="Support the work of"
          highlight="Vidhatha Society"
          description="Select a category to see sub-categories and suggested amounts. You can also choose a custom amount."
          align="center"
        />

        <div className="max-w-4xl mx-auto space-y-6">
          <div
            className="
              rounded-2xl bg-white border border-[#F2C41133]
              shadow-sm p-5 md:p-6
            "
          >
            <DonationCategories />
          </div>

          <p className="text-xs md:text-sm text-gray-600 text-center">
            Donations are tax-deductible as per applicable laws. For bank
            transfer or CSR enquiries, write to{" "}
            <a
              href="mailto:hello@vidhatha.org"
              className="font-semibold text-[#D62828] hover:underline"
            >
              vidhathasociety@gmail.com
            </a>
            .
          </p>
        </div>
      </PageShell>
    </>
  );
};

export default DonatePage;
