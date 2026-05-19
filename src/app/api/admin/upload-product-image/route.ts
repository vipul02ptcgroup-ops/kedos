import { NextResponse } from 'next/server';
import { getAdminStorageBucket } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const adminStorage = await getAdminStorageBucket();
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
    const object = adminStorage.file(objectPath);

    await object.save(buffer, {
      resumable: false,
      metadata: { contentType: file.type },
    });

    await object.makePublic();
    const url = `https://storage.googleapis.com/${adminStorage.name}/${objectPath}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    const msg = String(error?.message || 'Upload failed.');
    if (msg.includes("Cannot find module 'firebase-admin")) {
      return NextResponse.json(
        { error: "Server dependency missing: install 'firebase-admin' and restart." },
        { status: 500 }
      );
    }
    if (msg.includes('Missing Firebase Admin env vars')) {
      return NextResponse.json(
        {
          error:
            'Missing server env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
