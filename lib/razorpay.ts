import Razorpay from "razorpay";

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID as string;
  const key_secret = process.env.RAZORPAY_KEY_SECRET as string;
  if (!key_id || !key_secret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars.");
  }
  return new Razorpay({ key_id, key_secret });
}
