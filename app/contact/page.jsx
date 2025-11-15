"use client";
import React from "react";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [otherReason, setOtherReason] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [errorText, setErrorText] = React.useState("");

  // NOTE: Make sure Font Awesome CSS is loaded globally (e.g. in app/layout.tsx <head>):
  // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />

  function isValidPhone(raw) {
    if (!raw) return false;
    const normalized = raw.replace(/[()\s-]/g, "");
    return /^\+?\d{7,15}$/.test(normalized);
  }

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email";
    if (!phone.trim()) return "Phone number is required";
    if (!isValidPhone(phone.trim())) return "Enter a valid phone number (digits, optional +, 7-15 digits)";
    if (!purpose) return "Please select a purpose";
    if (purpose === "Others" && !otherReason.trim()) return "Please provide the reason for contacting (Others)";
    if (!message.trim()) return "Message is required";
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrorText("");
    const v = validate();
    if (v) { setErrorText(v); setStatus("error"); return; }

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
          message: message.trim()
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorText(data.error || "Failed to send message");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setName(""); setEmail(""); setPhone(""); setPurpose(""); setOtherReason(""); setMessage("");
      setErrorText("");
      if (data.previewUrl) console.log("Ethereal preview URL:", data.previewUrl);
    } catch (err) {
      console.error(err);
      setErrorText("Network error. Please try again.");
      setStatus("error");
    }
  }

  // details (wired from your provided data)
  const CONTACT_EMAIL = "vidhathasociety@gmail.com";
  const CONTACT_PHONE = "+919542366556"; // tel link uses international format
  const DISPLAY_PHONE = "9542366556";
  const ADDRESS = "Vidhatha Society, Hyderabad, Telangana, India";
  const mapsUrl = "https://www.google.com/maps/place/Vidhatha+Society/data=!4m2!3m1!1s0x0:0xb614d1ae5750a117?sa=X&ved=1t:2428&ictx=111";


  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Contact</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow-sm">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+911234567890 or 0123456789"
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (optional). Allowed: digits, spaces, dashes, parentheses, leading +.</p>
          </div>

          <div>
            <label className="block text-sm mb-1">Purpose</label>
            <select required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border rounded px-3 py-2">
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

          {purpose === "Others" && (
            <div>
              <label className="block text-sm mb-1">If Others — please specify reason</label>
              <input required value={otherReason} onChange={(e) => setOtherReason(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea required rows="5" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            <div className="mt-3">
              {status === "sent" && <div className="text-green-600">Message sent — thanks!</div>}
              {status === "error" && errorText && <div className="text-red-600">{errorText}</div>}
            </div>
          </div>
        </form>

        <aside className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Contact Details</h2>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Email</div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-gray-900 underline">{CONTACT_EMAIL}</a>

            <div className="text-sm text-gray-600 mt-2">Phone</div>
            <a href={`tel:${CONTACT_PHONE}`} className="text-sm text-gray-900 underline">{DISPLAY_PHONE}</a>

            <div className="text-sm text-gray-600 mt-4">Office Hours</div>
            <div className="text-sm text-gray-700">Mon — Sat: 9:30 AM — 6:30 PM</div>
          </div>

          {/* Social icons + address */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://www.facebook.com/VidhathaSociety/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition transform hover:scale-105"
                title="Facebook"
              >
                <i className="fab fa-facebook-f" />
              </a>

              <a
                href="https://www.instagram.com/vidhathasociety/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-pink-500 hover:text-white transition transform hover:scale-105"
                title="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>

              <a
                href="https://www.linkedin.com/in/vidhatha-society-ngo-aba53732b/"
                target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-blue-700 hover:text-white transition transform hover:scale-105"
                title="LinkedIn"
              >
                <i className="fab fa-linkedin-in" />
              </a>

              <a
                href="https://www.youtube.com/@vidhathasociety"
                target="_blank" rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white transition transform hover:scale-105"
                title="YouTube"
              >
                <i className="fab fa-youtube" />
              </a>

              <a
                href="https://whatsapp.com/channel/0029VavKC8R6hENmCKcOTi1u"
                target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white transition transform hover:scale-105"
                title="WhatsApp Channel"
              >
                <i className="fas fa-bullhorn" />
              </a>

              <a
                href="https://chat.whatsapp.com/J8iWUxXF8XqE9xLVh2IfRi?mode=ems_copy_t"
                target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp Chat"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white transition transform hover:scale-105"
                title="WhatsApp Chat"
              >
                <i className="fab fa-whatsapp" />
              </a>

              <a
                href="https://t.me/vidhathasocietytelegram"
                target="_blank" rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white transition transform hover:scale-105"
                title="Telegram"
              >
                <i className="fab fa-telegram-plane" />
              </a>
            </div>

            <a
              href={mapsUrl}
              target="_blank" rel="noopener noreferrer"
              className="block mt-4 p-3 rounded border border-gray-100 hover:shadow-md transition-colors bg-white"
              aria-label={`Open address in Google Maps: ${ADDRESS}`}
              title="Open in Google Maps"
            >
              <div className="text-xs text-gray-500">Office Address</div>
              <div className="text-sm font-semibold text-gray-900">{ADDRESS}</div>
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
