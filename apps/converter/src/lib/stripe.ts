import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  }
  return _stripe
}

export const PLANS = {
  // Pro tier — existing $29/month + $249/year. Unchanged. Auth: email + API key.
  monthly: { priceId: process.env.STRIPE_PRICE_MONTHLY!, label: '$29/month', amount: 2900, tier: 'pro' as const },
  yearly:  { priceId: process.env.STRIPE_PRICE_YEARLY!,  label: '$249/year', amount: 24900, tier: 'pro' as const },
  // Plus tier — new $0.97/month. Sonny creates the product + price in
  // Stripe (or via the one-shot script in PR D's description) and
  // sets STRIPE_PRICE_PLUS_MONTHLY in Vercel env. Auth: email + signed
  // cookie (no API key issued for Plus).
  plus_monthly: { priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY!, label: '$0.97/month', amount: 97, tier: 'plus' as const },
} as const

export type PlanKey = keyof typeof PLANS

/** Map a Stripe price ID back to its tier ('plus' or 'pro'). Used by the
 * webhook handler to record the right tier in converter_subscriptions when
 * checkout.session.completed fires. */
export function tierForPriceId(priceId: string | null | undefined): 'plus' | 'pro' {
  if (!priceId) return 'pro'
  if (process.env.STRIPE_PRICE_PLUS_MONTHLY && priceId === process.env.STRIPE_PRICE_PLUS_MONTHLY) return 'plus'
  return 'pro'
}
