import { NextRequest, NextResponse } from 'next/server'

// ONE-TIME SETUP ROUTE — DELETE AFTER USE
// Protected by token. Call once, paste output to Claude, then delete this file.

const SETUP_TOKEN = 'ud-stripe-live-2026-setup'

const PRODUCTS = [
  { name: 'UD Solo',                   amount: 900,     interval: 'month' as const },
  { name: 'UD Pro',                    amount: 2900,    interval: 'month' as const },
  { name: 'UD Premium',                amount: 4900,    interval: 'month' as const },
  { name: 'Enterprise Starter',        amount: 19900,   interval: 'month' as const },
  { name: 'Enterprise Pro',            amount: 49900,   interval: 'month' as const },
  { name: 'Enterprise Scale',          amount: 99900,   interval: 'month' as const },
  { name: 'cSDK Lite',                 amount: 49900,   interval: 'month' as const },
  { name: 'cSDK Pro',                  amount: 99900,   interval: 'month' as const },
  { name: 'cSDK Scale',                amount: 299900,  interval: 'month' as const },
  { name: 'UD Signer Solo',            amount: 1200,    interval: 'month' as const },
  { name: 'UD Signer Business',        amount: 2900,    interval: 'month' as const },
  { name: 'UD Solo Annual',            amount: 9000,    interval: 'year' as const },
  { name: 'UD Pro Annual',             amount: 24900,   interval: 'year' as const },
  { name: 'UD Premium Annual',         amount: 39900,   interval: 'year' as const },
  { name: 'Enterprise Starter Annual', amount: 199000,  interval: 'year' as const },
  { name: 'Enterprise Pro Annual',     amount: 499000,  interval: 'year' as const },
  { name: 'Enterprise Scale Annual',   amount: 999000,  interval: 'year' as const },
  { name: 'cSDK Lite Annual',          amount: 499000,  interval: 'year' as const },
  { name: 'cSDK Pro Annual',           amount: 999000,  interval: 'year' as const },
  { name: 'cSDK Scale Annual',         amount: 2999000, interval: 'year' as const },
  { name: 'UD Signer Solo Annual',     amount: 9900,    interval: 'year' as const },
  { name: 'UD Signer Business Annual', amount: 24900,   interval: 'year' as const },
]

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set in environment' }, { status: 500 })
  }
  if (!key.startsWith('sk_live_')) {
    return NextResponse.json({ error: `Key does not start with sk_live_ — got prefix: ${key.slice(0, 12)}` }, { status: 400 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(key)

  const priceIds: Record<string, string> = {}
  const paymentLinks: Record<string, string> = {}
  const results: Array<{ name: string; priceId: string; paymentLink: string; error?: string }> = []

  for (const p of PRODUCTS) {
    try {
      const product = await stripe.products.create({
        name: p.name,
        description: `Universal Document™ ${p.name} subscription`,
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.amount,
        currency: 'usd',
        recurring: { interval: p.interval },
      })

      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      })

      const slug = p.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      priceIds[slug] = price.id
      paymentLinks[slug] = `https://buy.stripe.com/${link.id}`

      results.push({ name: p.name, priceId: price.id, paymentLink: `https://buy.stripe.com/${link.id}` })
    } catch (err) {
      results.push({ name: p.name, priceId: '', paymentLink: '', error: (err as Error).message })
    }
  }

  return NextResponse.json({
    success: true,
    count: results.filter(r => !r.error).length,
    priceIds,
    paymentLinks,
    results,
  })
}
