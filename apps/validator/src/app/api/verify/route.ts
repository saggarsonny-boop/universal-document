import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { document, key, expectedSignature } = await req.json();
    if (!document || !key || !expectedSignature) {
      return NextResponse.json({ error: 'Missing document, key, or expectedSignature' }, { status: 400 });
    }

    const payload = JSON.stringify(document);
    const hash = crypto.createHmac('sha256', key).update(payload).digest('hex');

    const isValid = hash === expectedSignature;

    return NextResponse.json({ 
      isValid,
      computedHash: hash,
      message: isValid ? 'Signature matches. Document is authentic.' : 'Signature mismatch! Document may be tampered with.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
