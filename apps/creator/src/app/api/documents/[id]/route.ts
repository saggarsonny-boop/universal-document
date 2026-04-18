import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    const rows = await sql`
      SELECT * FROM creator_documents
      WHERE id = ${params.id} AND session_id = ${session_id}
      LIMIT 1
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ document: rows[0].content })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session_id, document } = await req.json()
    if (!session_id || !document) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await sql`
      UPDATE creator_documents
      SET content = ${JSON.stringify(document)}::jsonb,
          title = ${document.metadata?.title ?? 'Untitled'},
          updated_at = NOW()
      WHERE id = ${params.id} AND session_id = ${session_id}
    `
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    await sql`
      DELETE FROM creator_documents
      WHERE id = ${params.id} AND session_id = ${session_id}
    `
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
