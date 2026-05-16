import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { document, options } = await req.json();
    if (!document) return NextResponse.json({ error: 'Missing UDS document payload' }, { status: 400 });

    const hash = crypto.createHash('sha256').update(JSON.stringify(document)).digest('hex');
    
    const stampedDocument = {
      ...document,
      metadata: {
        ...document.metadata,
        cryptographic_stamp: hash,
        timestamp: new Date().toISOString(),
        engine_type: "Hasher"
      }
    };
    return NextResponse.json({ success: true, processedDocument: stampedDocument });
  } catch (error) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}