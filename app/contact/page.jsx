"use client";
import React from "react";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [otherReason, setOtherReason] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState("idle"); // idle | sending | sent | error
  const [errorText, setErrorText] = React.useState("");

  // Contact constants
  const CONTACT_EMAIL = "vidhathasociety@gmail.com";
  const CONTACT_PHONE = "+919542366556";
  const DISPLAY_PHONE = "+91 9542366556";
  const ADDRESS =
    "C-841, NGO Colony, Vanasthalipuram, Hyderabad, Telangana 500070";
  const mapsUrl =
    "https://www.google.com/maps/place/Vidhatha+Society/data=!4m2!3m1!1s0x0:0xb614d1ae5750a117?sa=X&ved=1t:2428&ictx=111";

  // ---------------- Validation ----------------
  function isValidPhone(raw) {
    if (!raw) return false;
    const normalized = raw.replace(/[()\s-]/g, "");
    return /^\+?\d{7,15}$/.test(normalized);
  }

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Enter a valid email";
    if (!phone.trim()) return "Phone number is required";
    if (!isValidPhone(phone.trim()))
      return "Enter a valid phone number (digits only, optional +)";
    if (!purpose) return "Please select a purpose";
    if (purpose === "Others" && !otherReason.trim())
      return "Please specify the reason for contacting";
    if (!message.trim()) return "Message is required";
    return null;
  }

  // ---------------- Submit ----------------
  async function onSubmit(e) {
    e.preventDefault();
    setErrorText("");
    const v = validate();
    if (v) {
      setErrorText(v);
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          purpose,
          otherReason: otherReason.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorText(data.error || "Failed to send message");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setPurpose("");
      setOtherReason("");
      setMessage("");
      setErrorText("");

      if (data.previewUrl) {
        console.log("Ethereal preview URL:", data.previewUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorText("Network error. Please try again.");
      setStatus("error");
    }
  }

  // ---------------- Inline SVG icons ----------------
  const Icon = {
    Facebook: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M22 12.07C22 6.66 17.52 2 12 2S2 6.66 2 12.07c0 5 3.66 9.15 8.44 9.95v-7.05H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.61 3.52-3.61.99 0 2.03.18 2.03.18v2.23H14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.9h-2.1V22C18.34 21.22 22 17.07 22 12.07z" />
      </svg>
    ),

    Instagram: (props) => (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </svg>
    ),

    LinkedIn: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v14H0zM8 8h4.8v2h.1c.7-1.2 2.4-2.5 4.9-2.5C23 7.5 24 10.1 24 14.3V22h-5v-7c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8V22H8V8z" />
      </svg>
    ),

    YouTube: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M23.5 7.1s-.2-1.6-.8-2.3c-.8-1-1.7-1-2.1-1.1C16.8 3.5 12 3.5 12 3.5h-.1s-4.8 0-8.5.2c-.4 0-1.4.1-2.1 1.1C.7 5.5.5 7.1.5 7.1S.2 9 .2 10.9v1.9C.2 14.9.5 16.9.5 16.9s.2 1.6.8 2.3c.8 1 1.9 1 2.4 1.1 1.8.1 7.8.2 7.8.2s4.8 0 8.5-.2c.4 0 1.4-.1 2.1-1.1.6-.7.8-2.3.8-2.3s.3-2 .3-3.9v-1.9c0-1.9-.3-3.9-.3-3.9zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z" />
      </svg>
    ),

    WhatsApp: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M20.5 3.5A11.7 11.7 0 0012 0C5.4 0 .2 5.3.2 11.9c0 2 0.5 3.9 1.5 5.6L0 24l6.9-1.8a11.8 11.8 0 005.1 1.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.2-3.4-8.3zM12 21.3a9.2 9.2 0 01-4.7-1.3l-.3-.2-4.1 1.1 1.1-3.9-.2-.4A9.3 9.3 0 1121.3 12 9.2 9.2 0 0112 21.3zM17 14.8c-.3-.1-1.9-.9-2.2-1-.3-.1-.5-.1-.8.1s-1 .8-1.2.9c-.2.1-.4.1-.7 0-.3-.1-1.1-.4-2-1.2-.8-.8-1.3-1.8-1.5-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.2-.2.2-.4.3-.7.1-.2 0-.4 0-.5 0-.1-.8-2-1.1-2.7-.3-.7-.7-.6-.9-.6h-.7c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.2s1 2.7 1.2 3c.2.3 2 3.1 4.9 4.4.7.3 1.3.4 1.8.5.8.2 1.4.2 1.9.1.6-.1 1.8-.7 2.1-1.5.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.4z" />
      </svg>
    ),

    Telegram: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 0C5.4 0 .2 5.4.2 12S5.4 24 12 24s11.8-5.4 11.8-12S18.6 0 12 0zm5.4 7.2l-1.1 5-1.7 4.9c-.2.6-.5.8-1 .8-.3 0-.5-.1-.7-.3l-1.8-1.6-1.3 1.2c-.2.2-.4.4-.7.4-.1 0-.3 0-.4-.1l.2-2.7 4.9-4.5c.2-.1.1-.4-.1-.3l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9L17 6.2c.5-.2.9 0 .4 1z" />
      </svg>
    ),

    X: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M3 3h4.4L13 10.2 18.2 3H21l-7 9.3L21.5 21H17L12 14.9 6.9 21H3.2l7.3-9.7L3 3z" />
      </svg>
    ),

    Pinterest: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 0C5.4 0 .7 4.9.7 10.8c0 4.5 2.8 7 4.6 7 .7 0 1.1-1.9 1.1-2.4 0-.6-1.4-1.7-1.4-4.1 0-3.9 3-6.7 7-6.7 3.4 0 5.9 2.1 5.9 5.8 0 3.5-1.8 6-4.1 6-1.3 0-2.3-1.1-2-2.4.4-1.6 1.1-3.3 1.1-4.4 0-1-0.6-1.9-1.9-1.9-1.5 0-2.7 1.6-2.7 3.8 0 1.4.5 2.3.5 2.3l-1.9 7.9c-.6 2.5-.1 5.6-.1 5.9l.1.1h.1c.2-.3 2.4-3 3.1-5.4l1.2-4.5c.6 1.1 2.1 1.9 3.7 1.9 4 0 6.9-3.4 6.9-8.1C23.3 4.3 18.7 0 12 0z" />
      </svg>
    ),

    // Blog / Blogger-style icon (white "b" inside orange square)
    Blog: (props) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        {/* outer orange rounded square (color from parent) */}
        <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
        {/* inner white "b"-like shape */}
        <path
          fill="white"
          d="M10 7.5c0-1 .8-1.8 1.8-1.8h1.4c1.7 0 3 1.3 3 3v1h.3c.8 0 1.5.7 1.5 1.5v2.2A3.6 3.6 0 0114.8 18h-4a3.8 3.8 0 01-3.8-3.8v-4c0-1.5 1.2-2.7 2.7-2.7H10zm-.8 3.3a.9.9 0 000 1.8h3.4a.9.9 0 100-1.8H9.2zm.9 3.6a.9.9 0 000 1.8h2.5a.9.9 0 100-1.8H10.1z"
        />
      </svg>
    ),
  };

  const socials = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/VidhathaSociety/",
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/vidhathasociety/",
      bg: "bg-pink-50",
      fg: "text-pink-600",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/vidhatha-society-ngo-aba53732b/",
      bg: "bg-blue-50",
      fg: "text-blue-700",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@vidhathasociety",
      bg: "bg-red-50",
      fg: "text-red-600",
    },
    {
      name: "WhatsApp",
      href: "https://whatsapp.com/channel/0029VavKC8R6hENmCKcOTi1u",
      bg: "bg-green-50",
      fg: "text-green-600",
    },
    {
      name: "Telegram",
      href: "https://t.me/vidhathasocietytelegram",
      bg: "bg-blue-50",
      fg: "text-sky-600",
    },
    {
      name: "X",
      href: "https://x.com/VidhathaSociety",
      bg: "bg-neutral-100",
      fg: "text-neutral-900",
    },
    {
      name: "Pinterest",
      href: "https://in.pinterest.com/vidhathasociety/",
      bg: "bg-red-50",
      fg: "text-red-700",
    },
    {
      name: "Blog",
      href: "https://vidhathasociety.blogspot.com/",
      bg: "bg-orange-50",
      fg: "text-orange-600",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F9FAFB] via-[#FFFDF7] to-[#FFF7D6]">
      {/* top stripe echoing letterhead */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F2C411] via-[#D62828] to-[#1D3A8A]" />

      <section className="container mx-auto px-4 py-10 md:py-14">
        {/* heading block */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D62828] mb-2">
            Contact
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            We’d love to hear from you
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Have a question about volunteering, donations, or collaborations?
            Send us a message and our team will get back to you soon.
          </p>
        </div>

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">
          {/* FORM CARD */}
          <form
            onSubmit={onSubmit}
            className="bg-white/90 shadow-lg shadow-yellow-100 border border-yellow-100 rounded-3xl p-6 md:p-7 space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Include country code if possible. Digits only (spaces/dashes
                  allowed).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                  required
                >
                  <option value="">Select purpose</option>
                  <option>Donor</option>
                  <option>Collaboration</option>
                  <option>Volunteer</option>
                  <option>Membership</option>
                  <option>Student Intern</option>
                  <option>Event Organising</option>
                  <option>Others</option>
                </select>
              </div>
            </div>

            {purpose === "Others" && (
              <div>
                <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                  Please specify
                </label>
                <input
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1.5">
                Message
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D62828]/70 focus:border-transparent"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#F2C411] to-[#D62828] shadow-md shadow-[#D62828]/40 hover:brightness-105 transition disabled:opacity-70"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              {status === "sent" && (
                <p className="text-sm text-green-600">
                  Message sent successfully!
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-600">{errorText}</p>
              )}
            </div>
          </form>

          {/* CONTACT DETAILS + SOCIALS */}
          <aside className="bg-white/90 border border-blue-50 rounded-3xl p-6 md:p-7 shadow-lg shadow-blue-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Reach Us
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You can always write to us or call during working hours. For
              urgent program or event enquiries, WhatsApp or Telegram is
              quickest.
            </p>

            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <span className="font-semibold">Email: </span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline decoration-[#D62828]/60 underline-offset-2 hover:text-[#D62828]"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <span className="font-semibold">Phone: </span>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="underline decoration-[#1D3A8A]/60 underline-offset-2 hover:text-[#1D3A8A]"
                >
                  {DISPLAY_PHONE}
                </a>
              </p>
              <p className="mt-2">
                <span className="font-semibold">Office Hours:</span>
                <br />
                Mon–Sat: 9:30 AM — 5:30 PM
              </p>
            </div>

            {/* Social icons */}
            <div className="mt-7">
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-gray-500 mb-4">
                Social Channels
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 text-center">
                {socials.map((s) => {
                  const Svg = Icon[s.name];
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center group"
                      aria-label={s.name}
                      title={s.name}
                    >
                      <div
                        className={
                          "w-12 h-12 rounded-full flex items-center justify-center transition transform group-hover:scale-110 group-hover:shadow-md " +
                          s.bg +
                          " " +
                          s.fg
                        }
                      >
                        <Svg className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] mt-1 text-gray-700">
                        {s.name}
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Address block - clickable */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-7 p-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-[#F9FAFB] to-[#ECF4FF] hover:shadow-md transition"
                aria-label={"Open address in Google Maps: " + ADDRESS}
              >
                <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-gray-500">
                  Office Address
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {ADDRESS}
                </p>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
