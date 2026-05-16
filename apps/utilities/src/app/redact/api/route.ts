import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { document, parameters } = await req.json();
    if (!document) return NextResponse.json({ error: 'Missing UDS document payload' }, { status: 400 });

    const mutatedBlocks = (document.blocks || []).map((b: any) => ({
      ...b,
      content: "[MUTATED/REDACTED/TRANSLATED] " + (b.content || '')
    }));

    const newHash = crypto.createHash('sha256').update(JSON.stringify(mutatedBlocks)).digest('hex');

    const mutatedDocument = {
      ...document,
      blocks: mutatedBlocks,
      provenance: {
        previous_hash: document.metadata?.cryptographic_stamp,
        new_hash: newHash,
        engine_type: "Mutator"
      }
    };

    return NextResponse.json({ success: true, processedDocument: mutatedDocument });
  } catch (error) {
    return NextResponse.json({ error: 'Mutation failed' }, { status: 500 });
  }
}