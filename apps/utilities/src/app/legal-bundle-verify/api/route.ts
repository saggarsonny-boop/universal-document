import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { documents } = await req.json();
    if (!documents || !Array.isArray(documents)) return NextResponse.json({ error: 'Missing documents array' }, { status: 400 });

    // Merkle tree root simulation
    const combinedHash = crypto.createHash('sha256').update(JSON.stringify(documents)).digest('hex');

    const packagedDocument = {
      ud_version: "1.0.0",
      metadata: {
        title: "Aggregated Package Bundle",
        merkle_root: combinedHash,
        engine_type: "Packager",
        child_count: documents.length
      },
      blocks: documents.flatMap((d: any) => d.blocks || [])
    };

    return NextResponse.json({ success: true, processedDocument: packagedDocument });
  } catch (error) {
    return NextResponse.json({ error: 'Packaging failed' }, { status: 500 });
  }
}