// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    // Build email content (simple HTML)
    const site = process.env.NEXT_PUBLIC_SITE_NAME ?? "Vidhatha Society";
    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    if (!toEmail) {
      return NextResponse.json({ error: "Contact destination email is not configured." }, { status: 500 });
    }

    const subject = `[Contact] ${site} — message from ${name}`;
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;">${escapeHtml(message)}</div>
      <hr/>
      <p>Sent from: ${escapeHtml(site)}</p>
    `;
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    const { info, previewUrl } = await sendMail({
      to: toEmail,
      subject,
      html,
      text,
      replyTo: email,
      fromName: `${name} via ${site}`,
    });

                const resp: { ok: boolean; message: string; previewUrl?: string } = {
            ok: true,
            message: "Message sent",
            };

            if (previewUrl) resp.previewUrl = previewUrl;

            return NextResponse.json(resp);

  } catch (err: unknown) {
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
