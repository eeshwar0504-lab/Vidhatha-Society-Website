import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, redirectBase } = body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok:false, error: "Missing payment fields" }, { status: 400 });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!secret) {
      return NextResponse.json({ ok:false, error: "Server missing RAZORPAY_KEY_SECRET" }, { status: 500 });
    }
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expected = hmac.digest("hex");
    const valid = expected === razorpay_signature;
    if (!valid) {
      const to = (redirectBase || "/donate/failed") + `?order=${encodeURIComponent(razorpay_order_id)}`;
      return NextResponse.json({ ok:false, redirect: to });
    }
    const to = (redirectBase || "/donate/success") + `?order=${encodeURIComponent(razorpay_order_id)}&payment=${encodeURIComponent(razorpay_payment_id)}`;
    return NextResponse.json({ ok:true, redirect: to });
  } catch (err:any) {
    console.error("Verify error:", err);
    return NextResponse.json({ ok:false, error: err?.message || "Verification failed" }, { status: 500 });
  }
}
