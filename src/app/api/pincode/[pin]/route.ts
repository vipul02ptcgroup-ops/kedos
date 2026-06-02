import { NextResponse } from 'next/server';

type PinResult = {
  city: string;
  state: string;
  source: string;
};

function isValidPin(pin: string) {
  return /^\d{6}$/.test(pin);
}

async function fetchZippopotam(pin: string): Promise<PinResult | null> {
  const res = await fetch(`https://api.zippopotam.us/in/${pin}`, {
    cache: 'force-cache',
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!res.ok) return null;
  const data: any = await res.json();
  const place = data?.places?.[0];
  const city = String(place?.['place name'] || '').trim();
  const state = String(place?.state || '').trim();
  if (!city || !state) return null;
  return { city, state, source: 'zippopotam' };
}

function jsonHeaders(cacheControl: string) {
  return {
    'Cache-Control': cacheControl,
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

export async function GET(_: Request, { params }: { params: { pin: string } }) {
  const pin = String(params?.pin || '').trim();
  if (!isValidPin(pin)) {
    return NextResponse.json(
      { ok: false, error: 'PIN must be 6 digits.' },
      { status: 400, headers: jsonHeaders('no-store') }
    );
  }

  try {
    const primary = await fetchZippopotam(pin);
    if (primary) {
      return NextResponse.json(
        { ok: true, data: primary },
        { status: 200, headers: jsonHeaders('public, s-maxage=604800, stale-while-revalidate=86400') }
      );
    }
  } catch {
    // ignore and return service-unavailable response below
  }

  return NextResponse.json(
    { ok: false, error: 'Unable to verify PIN from providers right now.' },
    { status: 502, headers: jsonHeaders('no-store') }
  );
}
