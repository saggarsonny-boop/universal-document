import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { documentA, documentB } = await req.json();
    if (!documentA || !documentB) {
      return NextResponse.json({ error: 'Missing documentA or documentB' }, { status: 400 });
    }

    const blocksA = documentA.blocks || [];
    const blocksB = documentB.blocks || [];
    
    const additions = blocksB.filter((b: any) => !blocksA.some((a: any) => a.id === b.id));
    const deletions = blocksA.filter((a: any) => !blocksB.some((b: any) => b.id === a.id));

    return NextResponse.json({ 
      differences: {
        additionsCount: additions.length,
        deletionsCount: deletions.length,
        additions,
        deletions
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Compare failed' }, { status: 500 });
  }
}
