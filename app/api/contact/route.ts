// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  otherReason?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ContactBody;
    const { name, email, phone, purpose, otherReason, message } = body || {};

    // basic validation
    if (!name || !email || !phone || !purpose || !message) {
      return NextResponse.json({ error: "Name, email, phone, purpose and message are required" }, { status: 400 });
    }

    // optional: stricter phone/email checks can be added here

    const site = process.env.NEXT_PUBLIC_SITE_NAME ?? "Vidhatha Society";
    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    if (!toEmail) {
      return NextResponse.json({ error: "Contact destination email is not configured." }, { status: 500 });
    }

    const subject = `[Contact] ${site} — ${name} (${purpose})`;
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Purpose:</strong> ${escapeHtml(purpose)}</p>
      ${purpose === "Others" ? `<p><strong>Other reason:</strong> ${escapeHtml(otherReason || "")}</p>` : ""}
      <hr/>
      <p><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;">${escapeHtml(message)}</div>
      <hr/>
      <p>Sent from: ${escapeHtml(site)}</p>
    `;

    const textLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Purpose: ${purpose}`,
      purpose === "Others" ? `Other reason: ${otherReason || ""}` : "",
      "",
      message,
    ].filter(Boolean);
    const text = textLines.join("\n");

    const { info, previewUrl } = await sendMail({
      to: toEmail,
      subject,
      html,
      text,
      replyTo: email,
      fromName: `${name} via ${site}`,
    });

    const resp: { ok: boolean; message: string; previewUrl?: string } = { ok: true, message: "Message sent" };
    if (previewUrl) resp.previewUrl = previewUrl;
    return NextResponse.json(resp);
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

function escapeHtml(str: string) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
