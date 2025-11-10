"use client";
import React from "react";
import donations from "../data/donations.json";

type Sub = { key:string; title:string; desc?:string; suggested?:number[] };
type Cat = { key:string; title:string; description?:string; subcategories:Sub[] };

export default function DonationCategories() {
  const cats: Cat[] = (donations as any).categories;
  const [active, setActive] = React.useState<string | null>(cats?.[0]?.key ?? null);

  const onSelect = (key:string) => setActive(key === active ? null : key);

  async function createOrder(amount:number, category:string, subcategory:string) {
    const res = await fetch("/api/donations/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, subcategory })
    });
    if (!res.ok) throw new Error((await res.json()).error || "Order failed");
    const data = await res.json();
    return data.order;
  }

  function openRazorpay(order:any, category:string, subcategory:string){
    // @ts-ignore
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
    if (!key) { alert("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID"); return; }
    // @ts-ignore
    const org = process.env.NEXT_PUBLIC_ORG_NAME || "Vidhatha Society";
    // @ts-ignore
    const logo = process.env.NEXT_PUBLIC_ORG_LOGO || undefined;
    const options:any = {
      key,
      amount: order.amount,
      currency: order.currency,
      name: org,
      description: `${category} → ${subcategory}`,
      order_id: order.id,
      image: logo,
      theme: { color: "#111111" },
      handler: async function (response:any) {
        try {
          const verifyRes = await fetch("/api/donations/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              redirectBase: "/donate/success"
            })
          });
          const vr = await verifyRes.json();
          if (vr.redirect) window.location.href = vr.redirect;
        } catch (e:any) {
          window.location.href = "/donate/failed";
        }
      },
      notes: { category, subcategory }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function startPayment(category:string, subcategory:string, amt:number){
    try {
      const order = await createOrder(amt, category, subcategory);
      openRazorpay(order, category, subcategory);
    } catch (e:any) {
      alert(e.message || "Unable to start payment");
    }
  }

  async function startCustom(category:string, subcategory:string){
    const raw = prompt("Enter custom amount (INR):");
    if (!raw) return;
    const amt = Number(raw);
    if (!Number.isFinite(amt) || amt <= 0) { alert("Please enter a valid amount"); return; }
    try {
      const order = await createOrder(amt, category, subcategory);
      openRazorpay(order, category, subcategory);
    } catch (e:any) {
      alert(e.message || "Unable to start payment");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {cats.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className={`px-4 py-2 rounded-full border transition ${active===c.key ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}
            aria-pressed={active===c.key}
          >
            {c.title}
          </button>
        ))}
      </div>

      {cats.map((c) => (
        <section
          key={c.key}
          className={`${active===c.key ? "block" : "hidden"} border rounded-2xl p-6`}
          aria-hidden={active!==c.key}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{c.title}</h2>
            {c.description ? <p className="text-sm text-gray-600 mt-1">{c.description}</p> : null}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.subcategories.map((s) => (
              <article key={s.key} className="border rounded-xl p-4 flex flex-col">
                <h3 className="text-lg font-medium">{s.title}</h3>
                {s.desc ? <p className="text-sm text-gray-600 mt-1 flex-1">{s.desc}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(s.suggested ?? [500,1000,2500]).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => startPayment(c.title, s.title, amt)}
                      className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50"
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => startCustom(c.title, s.title)}
                    className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50"
                  >
                    Custom
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
