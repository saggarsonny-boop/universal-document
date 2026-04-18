import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  }
  return _stripe
}

export const PLANS = {
  monthly: { priceId: process.env.STRIPE_PRICE_MONTHLY!, label: '$29/month', amount: 2900 },
  yearly: { priceId: process.env.STRIPE_PRICE_YEARLY!, label: '$249/year', amount: 24900 },
} as const
