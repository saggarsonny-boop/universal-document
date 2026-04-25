import { NextRequest, NextResponse } from 'next/server'
import { ensureRegistrySchema, getDocumentRecord } from '@shared/lib/registry'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  try {
    await ensureRegistrySchema()
    const record = await getDocumentRecord(id)
    if (!record) {
      return NextResponse.json({ registered: false }, { status: 200 })
    }
    return NextResponse.json({
      registered: true,
      id: record.id,
      hash: record.hash,
      title: record.title,
      sealed_at: record.sealed_at,
      revoked: record.revoked,
      revoked_at: record.revoked_at,
      blockchain_tx: record.blockchain_tx,
      events: record.events,
    })
  } catch (err: unknown) {
    console.error('Verify lookup error:', err)
    return NextResponse.json({ error: 'Registry unavailable' }, { status: 503 })
  }
}
