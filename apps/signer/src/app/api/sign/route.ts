import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { document, key } = await req.json();
    if (!document || !key) {
      return NextResponse.json({ error: 'Missing document or key' }, { status: 400 });
    }

    const payload = JSON.stringify(document);
    const hash = crypto.createHmac('sha256', key).update(payload).digest('hex');

    const signedDocument = {
      ...document,
      provenance: {
        timestamp: new Date().toISOString(),
        signature: hash,
        algorithm: 'HMAC-SHA256'
      }
    };

    return NextResponse.json({ signedDocument });
  } catch (error) {
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
  }
}
