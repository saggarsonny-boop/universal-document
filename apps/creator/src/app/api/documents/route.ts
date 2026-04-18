import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSession, ensureTables } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    await ensureTables()
    const rows = await sql`
      SELECT id, title, created_at, updated_at,
             content->>'ud_version' AS ud_version
      FROM creator_documents
      WHERE session_id = ${session_id}
      ORDER BY updated_at DESC
      LIMIT 100
    `
    return NextResponse.json({ documents: rows })
  } catch (e) {
    console.error('GET /api/documents:', e)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, document } = await req.json()
    if (!session_id || !document) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await ensureTables()
    await ensureSession(session_id)

    const id = crypto.randomUUID()
    await sql`
      INSERT INTO creator_documents (id, session_id, title, content)
      VALUES (${id}, ${session_id}, ${document.metadata?.title ?? 'Untitled'}, ${JSON.stringify(document)}::jsonb)
    `
    return NextResponse.json({ id })
  } catch (e) {
    console.error('POST /api/documents:', e)
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }
}
