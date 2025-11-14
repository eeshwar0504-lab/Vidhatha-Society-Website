import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body || {};
    if (!name || !email || !message) {
      return NextResponse.json({ ok:false, error: "Missing fields" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "data", "contact-submissions.json");
    let arr = [];
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf-8");
      arr = JSON.parse(raw || "[]");
    }
    arr.push({ name, email, message, createdAt: new Date().toISOString() });
    fs.writeFileSync(dataPath, JSON.stringify(arr, null, 2));

    return NextResponse.json({ ok:true });
  } catch (err: unknown) {
  console.error("Order error:", err);

  let message = "Failed to  submit contact form";
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else {
    try {
      message = JSON.stringify(err);
    } catch {
      // keep default message if stringify fails
    }
  }

  return NextResponse.json({ error: message }, { status: 500 });
}
}

