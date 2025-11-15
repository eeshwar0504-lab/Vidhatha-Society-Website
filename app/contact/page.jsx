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

  function isValidPhone(raw) {
    if (!raw) return false;
    // normalize: remove spaces, dashes, parentheses
    const normalized = raw.replace(/[()\s-]/g, "");
    // Accept optional leading +, then 7-15 digits
    return /^\+?\d{7,15}$/.test(normalized);
  }

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    // basic email check
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

      // success
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

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>

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
          <h2 className="text-lg font-semibold mb-2">Contact Details</h2>
          <p className="text-sm text-gray-700">Email: <a href="mailto:info@vidhathasociety.com" className="underline">info@vidhathasociety.com</a></p>
          <p className="text-sm text-gray-700 mt-2">Phone: <a href="tel:+911234567890" className="underline">+91 12345 67890</a></p>
          <p className="text-sm text-gray-700 mt-4">Office Hours: Mon — Sat: 9:30 AM — 6:30 PM</p>
        </aside>
      </div>
    </main>
  );
}
