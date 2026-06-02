import { NextResponse } from 'next/server';
import { resolveWorkingStorageBucket } from '@/lib/firebaseAdmin';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'Content-Type': 'application/json; charset=utf-8',
};

async function saveToBucket(
  bucket: any,
  objectPath: string,
  fileType: string,
  buffer: Buffer
) {
  const object = bucket.file(objectPath);
  const downloadToken = randomUUID();
  await object.save(buffer, {
    resumable: false,
    metadata: {
      contentType: fileType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });
  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

export async function POST(req: Request) {
  try {
    const adminStorage = await resolveWorkingStorageBucket();
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file uploaded.' }, { status: 400, headers: JSON_HEADERS });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Only image files are allowed.' }, { status: 400, headers: JSON_HEADERS });
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, error: 'File is too large. Max 10MB.' }, { status: 400, headers: JSON_HEADERS });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const objectPath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveToBucket(adminStorage, objectPath, file.type, buffer);

    return NextResponse.json({ ok: true, data: { url } }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    const msg = String(error?.message || 'Upload failed.');
    const code = error?.code ? String(error.code) : '';
    if (msg.includes("Cannot find module 'firebase-admin")) {
      return NextResponse.json(
        { ok: false, error: "Server dependency missing: install 'firebase-admin' and restart." },
        { status: 500, headers: JSON_HEADERS }
      );
    }
    if (msg.includes('Missing Firebase Admin env vars')) {
      return NextResponse.json(
        { ok: false, error: msg.replace('Missing Firebase Admin env vars', 'Missing server env vars') },
        { status: 500, headers: JSON_HEADERS }
      );
    }
    if (msg.includes('No working Firebase Storage bucket found')) {
      return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: JSON_HEADERS });
    }
    return NextResponse.json(
      {
        ok: false,
        error: code ? `${msg} (code: ${code})` : msg,
      },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
