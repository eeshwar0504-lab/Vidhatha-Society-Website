import React from "react";
import Link from "next/link";

export const metadata = { title: "Donation Success | Vidhatha Society" };

export default function DonationSuccess({ searchParams }: { searchParams?: { [key:string]: string | string[] | undefined }}) {
  const order = (searchParams?.order as string) || "";
  const payment = (searchParams?.payment as string) || "";
  return (
    <main className="container mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-bold">Thank you for your donation!</h1>
      <p className="text-gray-700">Your support helps us continue our programs.</p>
      <div className="border rounded-xl p-4">
        <div><strong>Order ID:</strong> {order}</div>
        <div><strong>Payment ID:</strong> {payment}</div>
      </div>
      <Link href="/" className="inline-flex px-4 py-2 rounded-lg bg-black text-white">Go to Home</Link>
    </main>
  );
}
