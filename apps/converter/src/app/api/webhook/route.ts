import { NextRequest, NextResponse } from 'next/server'
import { getStripe, tierForPriceId } from '@/lib/stripe'
import { ensureSchema, upsertSubscription, updateSubscriptionStatus } from '@/lib/db'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e) {
    console.error('Webhook signature failed:', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await ensureSchema()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === 'subscription' && session.customer_email && session.subscription) {
      // Inspect the subscription to determine tier (Plus vs Pro). The
      // Checkout Session doesn't include line_items.price.id by default,
      // so we fetch the subscription explicitly.
      let tier: 'plus' | 'pro' = 'pro'
      try {
        const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items?.data?.[0]?.price?.id
        tier = tierForPriceId(priceId)
      } catch (err) {
        console.warn('Could not determine tier from subscription, defaulting to pro:', err)
      }
      await upsertSubscription({
        email: session.customer_email,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: 'active',
        tier,
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const status = sub.status === 'active' ? 'active' : 'cancelled'
    await updateSubscriptionStatus(sub.id, status)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await updateSubscriptionStatus(sub.id, 'cancelled')
  }

  return NextResponse.json({ received: true })
}
