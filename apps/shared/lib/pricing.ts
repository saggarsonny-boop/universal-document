/**
 * Shared pricing library for Universal Document™ ecosystem.
 * Price IDs are populated after Stripe products are created via API.
 * Run: node scripts/create-stripe-products.js to populate.
 */

export const STRIPE_PRICES: Record<string, { monthly?: string; annual?: string; name: string; amount: number }> = {
  ud_solo: {
    name: 'UD Solo',
    amount: 9,
    monthly: process.env.STRIPE_PRICE_UD_SOLO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_UD_SOLO_ANNUAL  ?? '',
  },
  ud_pro: {
    name: 'UD Pro',
    amount: 29,
    monthly: process.env.STRIPE_PRICE_UD_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_UD_PRO_ANNUAL  ?? '',
  },
  ud_premium: {
    name: 'UD Premium',
    amount: 49,
    monthly: process.env.STRIPE_PRICE_UD_PREMIUM_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_UD_PREMIUM_ANNUAL  ?? '',
  },
  enterprise_starter: {
    name: 'Enterprise Starter',
    amount: 199,
    monthly: process.env.STRIPE_PRICE_ENT_STARTER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ENT_STARTER_ANNUAL  ?? '',
  },
  enterprise_pro: {
    name: 'Enterprise Pro',
    amount: 499,
    monthly: process.env.STRIPE_PRICE_ENT_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ENT_PRO_ANNUAL  ?? '',
  },
  enterprise_scale: {
    name: 'Enterprise Scale',
    amount: 999,
    monthly: process.env.STRIPE_PRICE_ENT_SCALE_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ENT_SCALE_ANNUAL  ?? '',
  },
  csdk_lite: {
    name: 'cSDK Lite',
    amount: 499,
    monthly: process.env.STRIPE_PRICE_CSDK_LITE_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_CSDK_LITE_ANNUAL  ?? '',
  },
  csdk_pro: {
    name: 'cSDK Pro',
    amount: 999,
    monthly: process.env.STRIPE_PRICE_CSDK_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_CSDK_PRO_ANNUAL  ?? '',
  },
  csdk_scale: {
    name: 'cSDK Scale',
    amount: 2999,
    monthly: process.env.STRIPE_PRICE_CSDK_SCALE_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_CSDK_SCALE_ANNUAL  ?? '',
  },
  ud_signer_solo: {
    name: 'UD Signer Solo',
    amount: 12,
    monthly: process.env.STRIPE_PRICE_SIGNER_SOLO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_SIGNER_SOLO_ANNUAL  ?? '',
  },
  ud_signer_business: {
    name: 'UD Signer Business',
    amount: 29,
    monthly: process.env.STRIPE_PRICE_SIGNER_BIZ_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_SIGNER_BIZ_ANNUAL  ?? '',
  },
}

export const TIER_HIERARCHY = [
  'free',
  'ud_solo',
  'ud_pro',
  'ud_premium',
  'ud_signer_solo',
  'ud_signer_business',
  'enterprise_starter',
  'enterprise_pro',
  'enterprise_scale',
  'csdk_lite',
  'csdk_pro',
  'csdk_scale',
] as const

export type Tier = (typeof TIER_HIERARCHY)[number]

export function tierIndex(tier: string): number {
  const idx = TIER_HIERARCHY.indexOf(tier as Tier)
  return idx === -1 ? 0 : idx
}

export async function getUserTier(_userId: string): Promise<Tier> {
  // Beta: all users get full access. Replace with Stripe customer lookup post-beta.
  return 'csdk_scale'
}

export function hasAccess(userTier: string, requiredTiers: string[]): boolean {
  if (requiredTiers.includes('free')) return true
  // Beta: everything is free
  return true
  // Post-beta: return requiredTiers.some(t => tierIndex(userTier) >= tierIndex(t))
}

export function getUpgradeUrl(requiredTier: string): string {
  const price = STRIPE_PRICES[requiredTier]
  if (!price) return 'https://ud.hive.baby/pricing'
  return `https://ud.hive.baby/pricing?plan=${requiredTier}`
}

export function formatPrice(tier: string, interval: 'monthly' | 'annual' = 'monthly'): string {
  const price = STRIPE_PRICES[tier]
  if (!price) return ''
  const amount = interval === 'annual' ? Math.round(price.amount * 10 * 0.85) / 10 : price.amount
  return `$${amount}/${interval === 'annual' ? 'year' : 'mo'}`
}
