import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { ensureSchema } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: 'monthly' | 'yearly' }
    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    await ensureSchema()
    const stripe = getStripe()
    const origin = req.headers.get('origin') ?? 'https://converter.hive.baby'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${origin}/pro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
