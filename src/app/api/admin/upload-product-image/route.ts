import { NextResponse } from 'next/server';
import { resolveWorkingStorageBucket } from '@/lib/firebaseAdmin';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

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
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File is too large. Max 10MB.' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const objectPath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveToBucket(adminStorage, objectPath, file.type, buffer);

    return NextResponse.json({ url });
  } catch (error: any) {
    const msg = String(error?.message || 'Upload failed.');
    const code = error?.code ? String(error.code) : '';
    if (msg.includes("Cannot find module 'firebase-admin")) {
      return NextResponse.json(
        { error: "Server dependency missing: install 'firebase-admin' and restart." },
        { status: 500 }
      );
    }
    if (msg.includes('Missing Firebase Admin env vars')) {
      return NextResponse.json(
        { error: msg.replace('Missing Firebase Admin env vars', 'Missing server env vars') },
        { status: 500 }
      );
    }
    if (msg.includes('No working Firebase Storage bucket found')) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json(
      {
        error: code ? `${msg} (code: ${code})` : msg,
      },
      { status: 500 }
    );
  }
}
