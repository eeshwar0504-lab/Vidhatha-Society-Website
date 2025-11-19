"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Simple global toast system.
 *
 * Usage:
 * import { toast } from "@/components/ToastProvider";
 * toast.success("Saved");
 * toast.error("Failed");
 *
 * Implementation:
 * - Exports `toast` object with success/error/info functions which dispatch a CustomEvent
 * - ToastProvider listens to that event and displays toasts
 */

let ensureContainer = () => {
  if (typeof document === "undefined") return null;
  let el = document.getElementById("vidhatha-toast-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "vidhatha-toast-root";
    document.body.appendChild(el);
  }
  return el;
};

export const toast = {
  success: (message) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("vidhatha-toast", { detail: { type: "success", message } }));
  },
  error: (message) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("vidhatha-toast", { detail: { type: "error", message } }));
  },
  info: (message) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("vidhatha-toast", { detail: { type: "info", message } }));
  },
};

function ToastItem({ t, onRemove }) {
  const color = t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-slate-600";
  useEffect(() => {
    const tm = setTimeout(() => onRemove(t.id), t.duration || 4000);
    return () => clearTimeout(tm);
  }, [t, onRemove]);
  return (
    <div className={`mb-2 w-80 max-w-full p-3 rounded shadow-md text-white ${color} flex items-start gap-3`}>
      <div className="flex-1 text-sm break-words">{t.message}</div>
      <button aria-label="Dismiss" onClick={() => onRemove(t.id)} className="opacity-90 hover:opacity-100">✕</button>
    </div>
  );
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e) => {
      const id = Math.random().toString(36).slice(2, 9);
      const detail = e.detail || {};
      const newToast = {
        id,
        type: detail.type || "info",
        message: detail.message || "",
        duration: detail.duration || 4000,
      };
      setToasts((t) => [newToast, ...t].slice(0, 6));
    };

    window.addEventListener("vidhatha-toast", handler);
    return () => window.removeEventListener("vidhatha-toast", handler);
  }, []);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const root = ensureContainer();
  if (!root) return null;

  return createPortal(
    <div className="fixed z-[9999] right-4 top-4 flex flex-col items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onRemove={remove} />
      ))}
    </div>,
    root
  );
}
