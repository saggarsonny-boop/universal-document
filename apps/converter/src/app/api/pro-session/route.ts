import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { ensureSchema, getSubscriptionByEmail, getApiKeyByEmail } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_email ?? session.customer_details?.email ?? null
    if (!email) return NextResponse.json({ error: 'No email in session' }, { status: 400 })

    await ensureSchema()
    const sub = await getSubscriptionByEmail(email)
    const apiKey = await getApiKeyByEmail(email)

    return NextResponse.json({
      email,
      active: !!sub,
      hasApiKey: !!apiKey,
      keyPrefix: apiKey ? (apiKey as { key_prefix: string }).key_prefix : null,
    })
  } catch (e) {
    console.error('Pro session error:', e)
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 })
  }
}
