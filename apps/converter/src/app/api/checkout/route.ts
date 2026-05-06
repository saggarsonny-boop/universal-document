import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS, type PlanKey } from '@/lib/stripe'
import { ensureSchema } from '@/lib/db'

export const runtime = 'nodejs'

function isPlanKey(s: string): s is PlanKey {
  return s in PLANS
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: string }
    if (!isPlanKey(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    const planEntry = PLANS[plan]
    if (!planEntry.priceId) {
      // Plus price not configured yet — Sonny still needs to create the
      // Stripe product + add STRIPE_PRICE_PLUS_MONTHLY to env.
      return NextResponse.json(
        { error: `${plan} plan is not yet configured. STRIPE_PRICE_PLUS_MONTHLY env var is missing.` },
        { status: 503 },
      )
    }

    await ensureSchema()
    const stripe = getStripe()
    const origin = req.headers.get('origin') ?? 'https://converter.hive.baby'

    // Pro tier returns to /pro for API-key issuance; Plus tier returns
    // to / so the page-level handler can exchange session_id → signed
    // cookie via /api/auth/plus-session.
    const successPath = planEntry.tier === 'plus'
      ? '/?plus_session_id={CHECKOUT_SESSION_ID}'
      : '/pro?session_id={CHECKOUT_SESSION_ID}'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planEntry.priceId, quantity: 1 }],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/pricing`,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
