import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { documentA, documentB } = await req.json();
    if (!documentA || !documentB) {
      return NextResponse.json({ error: 'Missing documentA or documentB' }, { status: 400 });
    }

    // UDS Merge Logic MVP
    const mergedDocument = {
      ud_version: "1.0.0",
      metadata: {
        title: `Merged: ${documentA.metadata?.title || 'DocA'} + ${documentB.metadata?.title || 'DocB'}`,
        createdAt: new Date().toISOString()
      },
      blocks: [
        ...(documentA.blocks || []),
        ...(documentB.blocks || [])
      ]
    };

    return NextResponse.json({ mergedDocument });
  } catch (error) {
    return NextResponse.json({ error: 'Merge failed' }, { status: 500 });
  }
}
