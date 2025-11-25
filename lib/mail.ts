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

  // Defaults tuned for Gmail
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Decide secure based on env or port
  const secureEnv = process.env.SMTP_SECURE;
  const secure =
    typeof secureEnv === "string"
      ? secureEnv === "true"
      : port === 465; // if not specified, 465 => secure, 587 => STARTTLS

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure, // for Gmail: 587+false or 465+true
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

  // If you want to force from = SMTP_USER (Gmail), uncomment below:
  // const fromEmail = process.env.SMTP_USER as string;

  const fromEmail =
    process.env.NOREPLY_FROM_EMAIL ??
    process.env.SMTP_USER ?? // fallback to SMTP_USER if set
    `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "localhost"}`;

  const mail = {
    from: `"${fromName.replace(/"/g, "'")}" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  };

  const info = await t.sendMail(mail);

  const previewUrl =
    process.env.NODE_ENV !== "production"
      ? getTestMessageUrl(info) || undefined
      : undefined;

  return { info, previewUrl };
}
