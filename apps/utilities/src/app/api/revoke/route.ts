import { NextRequest, NextResponse } from 'next/server'
import { ensureRegistrySchema, revokeDocument } from '@shared/lib/registry'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Document id required' }, { status: 400 })
    }
    await ensureRegistrySchema()
    await revokeDocument(id)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Registry revoke failed:', err)
    // Non-fatal: revocation is still embedded in the file
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Registry error' }, { status: 200 })
  }
}
