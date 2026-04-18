import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, getSubscriptionByEmail, createApiKey, getApiKeyByEmail } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'

function getEmailFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-pro-email') ?? null
}

export async function GET(req: NextRequest) {
  const email = getEmailFromRequest(req)
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 401 })

  await ensureSchema()
  const sub = await getSubscriptionByEmail(email)
  if (!sub) return NextResponse.json({ error: 'No active Pro subscription' }, { status: 403 })

  const key = await getApiKeyByEmail(email)
  return NextResponse.json({ key })
}

export async function POST(req: NextRequest) {
  const email = getEmailFromRequest(req)
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 401 })

  await ensureSchema()
  const sub = await getSubscriptionByEmail(email)
  if (!sub) return NextResponse.json({ error: 'No active Pro subscription' }, { status: 403 })

  const rawKey = `cvt_${uuidv4().replace(/-/g, '')}`
  await createApiKey(email, rawKey)

  return NextResponse.json({ key: rawKey, prefix: rawKey.slice(0, 12) })
}
