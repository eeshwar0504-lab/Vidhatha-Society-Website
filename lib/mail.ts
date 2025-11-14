import nodemailer from "nodemailer";
import { getTestMessageUrl } from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
  replyTo?: string;
};

// Transporter type — correct & strict
type TransporterType = ReturnType<typeof nodemailer.createTransport>;

let transporter: TransporterType | null = null;

export async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  // Auto-create test account in dev mode
  if (process.env.NODE_ENV !== "production") {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.warn("Using Ethereal test SMTP account.");
    return transporter;
  }

  throw new Error(
    "No SMTP config found. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
  );
}

export async function sendMail(opts: MailOptions) {
  const t = await getTransporter();

  const fromName =
    opts.fromName ?? process.env.NOREPLY_FROM_NAME ?? "Vidhatha Society";

  const fromEmail =
    process.env.NOREPLY_FROM_EMAIL ??
    `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "localhost"}`;

  const mail = {
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  };

  const info = await t.sendMail(mail);

  // ✔ NO require() ✔ NO any
  const previewUrl =
    process.env.NODE_ENV !== "production"
      ? getTestMessageUrl(info) || undefined
      : undefined;

  return { info, previewUrl };
}
