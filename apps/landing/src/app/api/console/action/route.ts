import { NextRequest, NextResponse } from 'next/server'

const TESTING_BASE = process.env.NEXT_PUBLIC_TESTING_STATION_URL || 'https://test.hive.baby'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action, ...payload } = body

  let endpoint = ''
  if (action === 'grant-credit') endpoint = '/api/admin/grant-credit'
  else if (action === 'add-note') endpoint = '/api/admin/note'
  else return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  try {
    const res = await fetch(`${TESTING_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
