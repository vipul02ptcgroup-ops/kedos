import { NextResponse } from 'next/server';
import https from 'node:https';

type PinResult = {
  city: string;
  state: string;
  source: string;
};

function isValidPin(pin: string) {
  return /^\d{6}$/.test(pin);
}

async function fetchZippopotam(pin: string): Promise<PinResult | null> {
  const res = await fetch(`https://api.zippopotam.us/in/${pin}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data: any = await res.json();
  const place = data?.places?.[0];
  const city = String(place?.['place name'] || '').trim();
  const state = String(place?.state || '').trim();
  if (!city || !state) return null;
  return { city, state, source: 'zippopotam' };
}

async function fetchPostalPincodeInsecure(pin: string): Promise<PinResult | null> {
  const data = await new Promise<any>((resolve, reject) => {
    https
      .get(
        `https://api.postalpincode.in/pincode/${pin}`,
        { agent: new https.Agent({ rejectUnauthorized: false }) },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => {
            raw += chunk;
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(raw));
            } catch (err) {
              reject(err);
            }
          });
        }
      )
      .on('error', reject);
  });

  const postOffice = data?.[0]?.PostOffice?.[0];
  const city = String(postOffice?.District || '').trim();
  const state = String(postOffice?.State || '').trim();
  if (!city || !state) return null;
  return { city, state, source: 'postalpincode.in(insecure-fallback)' };
}

export async function GET(_: Request, { params }: { params: { pin: string } }) {
  const pin = String(params?.pin || '').trim();
  if (!isValidPin(pin)) {
    return NextResponse.json({ ok: false, error: 'PIN must be 6 digits.' }, { status: 400 });
  }

  try {
    const primary = await fetchZippopotam(pin);
    if (primary) return NextResponse.json({ ok: true, ...primary });
  } catch {
    // fall through to fallback
  }

  try {
    const fallback = await fetchPostalPincodeInsecure(pin);
    if (fallback) return NextResponse.json({ ok: true, ...fallback });
  } catch {
    // ignore
  }

  return NextResponse.json(
    { ok: false, error: 'Unable to verify PIN from providers right now.' },
    { status: 502 }
  );
}

