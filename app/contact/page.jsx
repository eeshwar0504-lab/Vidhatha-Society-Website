"use client";
import React from "react";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState("idle");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      // mock submit — replace with real API when ready
      await new Promise((r) => setTimeout(r, 500));
      setStatus("sent");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea required rows="4" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "sent" && <div className="text-green-600 mt-2">Message sent — thanks!</div>}
            {status === "error" && <div className="text-red-600 mt-2">Something went wrong.</div>}
          </div>
        </form>
      </div>
    </main>
  );
}