// PR D — Plus tier session-exchange endpoint.
//
// Called by the client after Stripe redirects to /?plus_session_id=cs_...
// Validates the Stripe session is paid and is for a Plus subscription,
// then sets the `ud_plus` HttpOnly+Secure signed cookie. Once the
// cookie is set, /api/usage and the rate-limit checks recognise the
// user as a Plus subscriber.

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, tierForPriceId } from '@/lib/stripe'
import { ensureSchema, upsertSubscription, getSubscriptionWithTier } from '@/lib/db'
import { issuePlusCookie } from '@/lib/plus-auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_email ?? session.customer_details?.email ?? null
    const customerId = (session.customer as string | null) ?? null
    const subscriptionId = (session.subscription as string | null) ?? null

    if (!email || !customerId || !subscriptionId) {
      return NextResponse.json({ error: 'Stripe session is incomplete (missing email / customer / subscription)' }, { status: 400 })
    }
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not yet confirmed. Try refreshing in a few seconds.' }, { status: 402 })
    }

    // Confirm this is a Plus subscription (not Pro). The webhook may
    // have already inserted the subscription; if it hasn't, fetch the
    // sub directly and upsert.
    let tier: 'plus' | 'pro' = 'pro'
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = sub.items?.data?.[0]?.price?.id
      tier = tierForPriceId(priceId)
    } catch (err) {
      console.warn('Could not retrieve subscription:', err)
    }

    if (tier !== 'plus') {
      return NextResponse.json({ error: 'This session is not a Plus subscription. Use /pro?session_id=... for Pro.' }, { status: 400 })
    }

    await ensureSchema()
    // Idempotent — webhook may have already done this.
    await upsertSubscription({
      email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'active',
      tier: 'plus',
    })

    // Issue the signed cookie.
    const cookie = issuePlusCookie({ email, customerId })

    const sub = await getSubscriptionWithTier(email)
    return new NextResponse(
      JSON.stringify({
        ok: true,
        email,
        tier: 'plus',
        active: sub?.active ?? true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie.serialized,
        },
      },
    )
  } catch (err) {
    console.error('Plus session exchange failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to retrieve session' }, { status: 500 })
  }
}
