// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
      return NextResponse.json(
        { error: "Name, email, phone, purpose and message are required" },
        { status: 400 }
      );
    }

    const site = process.env.NEXT_PUBLIC_SITE_NAME ?? "Vidhatha Society";

    // ===== SMTP CONFIG FROM ENV =====
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = process.env.SMTP_SECURE !== "false"; // default true (465)

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "SMTP credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const toEmail =
      process.env.CONTACT_TO_EMAIL || process.env.CONTACT_TO || smtpUser;

    // create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // quick verify – this is where your 535 EAUTH happens if creds are wrong
    await transporter
  .verify()
  .catch((err: any) => {
    console.error("SMTP verify error:", err);
    throw err;
  });


    const subject = `[Contact] ${site} — ${name} (${purpose})`;

    const html = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Purpose:</strong> ${escapeHtml(purpose)}</p>
      ${
        purpose === "Others"
          ? `<p><strong>Other reason:</strong> ${escapeHtml(
              otherReason || ""
            )}</p>`
          : ""
      }
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
    ].filter(Boolean as any);
    const text = textLines.join("\n");

    const fromName = `${name} via ${site}`;
    const fromHeader = `"${fromName.replace(/"/g, "'")}" <${smtpUser}>`;

    const info = await transporter.sendMail({
      from: fromHeader,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      ok: true,
      message: "Message sent",
      messageId: info.messageId,
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      {
        error: "Failed to send message",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

function escapeHtml(str?: string) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
