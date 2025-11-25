// app/api/volunteer/submit/route.ts
import { NextResponse } from 'next/server';

type VolunteerPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  skills?: unknown;
  availability?: unknown;
  message?: unknown;
  secret?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VolunteerPayload;

    if (!isNonEmptyString(body.name) || !isNonEmptyString(body.email) || !isNonEmptyString(body.skills)) {
      return NextResponse.json({ error: 'Validation error: name, email and skills are required.' }, { status: 400 });
    }

    const forwardPayload: Record<string, string> = {
      name: body.name as string,
      email: body.email as string,
      phone: isNonEmptyString(body.phone) ? (body.phone as string) : '',
      skills: body.skills as string,
      availability: isNonEmptyString(body.availability) ? (body.availability as string) : '',
      message: isNonEmptyString(body.message) ? (body.message as string) : '',
    };

    if (process.env.GAS_SECRET) forwardPayload.secret = process.env.GAS_SECRET;

    const GAS_URL = process.env.GAS_WEBAPP_URL;
    if (!GAS_URL) {
      console.error('GAS_WEBAPP_URL is not set in environment');
      return NextResponse.json({ error: 'Server misconfiguration: GAS_WEBAPP_URL not set.' }, { status: 500 });
    }

    const forwardRes = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardPayload),
    });

    const text = await forwardRes.text(); // read raw text
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch (_) { parsed = text; }

    // log details to server console for debugging
    console.log('Forwarded payload to Apps Script:', forwardPayload);
    console.log('Apps Script response status:', forwardRes.status, 'statusText:', forwardRes.statusText);
    console.log('Apps Script raw response:', text);

    if (!forwardRes.ok) {
      return NextResponse.json(
        { error: 'Failed to save to sheet', status: forwardRes.status, detail: parsed },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, detail: parsed });
  } catch (err) {
    console.error('Error in /api/volunteer/submit:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
