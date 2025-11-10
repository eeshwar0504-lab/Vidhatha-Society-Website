import React from "react";
import Link from "next/link";

export const metadata = { title: "Donation Failed | Vidhatha Society" };

export default function DonationFailed({ searchParams }: { searchParams?: { [key:string]: string | string[] | undefined }}) {
  const order = (searchParams?.order as string) || "";
  return (
    <main className="container mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-bold">Donation not completed</h1>
      <p className="text-gray-700">Your payment was not verified. You can try again.</p>
      {order ? <div className="text-sm text-gray-600">Order: {order}</div> : null}
      <Link href="/donate" className="inline-flex px-4 py-2 rounded-lg bg-black text-white">Back to Donate</Link>
    </main>
  );
}
