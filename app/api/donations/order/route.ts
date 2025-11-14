import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, subcategory } = body || {};
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount (in INR) is required" }, { status: 400 });
    }
    const amtPaise = Math.round(Number(amount) * 100);
    const rzp = getRazorpay();
    const receipt = `don_${Date.now()}`;
    const order = await rzp.orders.create({
      amount: amtPaise,
      currency: "INR",
      receipt,
      notes: {
        category: category || "",
        subcategory: subcategory || ""
      }
    });
    return NextResponse.json({ order });
  } catch (err: unknown) {
  console.error("Order error:", err);

  let message = "Failed to create order";
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else {
    try {
      message = JSON.stringify(err);
    } catch {
      // keep default message if stringify fails
    }
  }

  return NextResponse.json({ error: message }, { status: 500 });
}

}
