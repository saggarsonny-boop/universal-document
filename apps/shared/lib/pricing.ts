/**
 * Shared pricing library for Universal Document™ ecosystem.
 * Live Stripe price IDs and payment links — created April 24 2026.
 */

export const STRIPE_PRICES: Record<string, {
  name: string
  amount: number
  monthly?: string
  annual?: string
  paymentLink?: string
  paymentLinkAnnual?: string
}> = {
  ud_solo: {
    name: 'UD Solo',
    amount: 9,
    monthly:          'price_1TPtJ2PIZtoQZOG1cOYsKZbI',
    annual:           'price_1TPtJAPIZtoQZOG1ywp29gzN',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ2PIZtoQZOG177D6wf7J',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJBPIZtoQZOG1CuZkmRMd',
  },
  ud_pro: {
    name: 'UD Pro',
    amount: 29,
    monthly:          'price_1TPtJ2PIZtoQZOG13GimEZoi',
    annual:           'price_1TPtJBPIZtoQZOG1j18iDp3z',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ3PIZtoQZOG14zH50WxQ',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJBPIZtoQZOG1xErmXCuK',
  },
  ud_premium: {
    name: 'UD Premium',
    amount: 49,
    monthly:          'price_1TPtJ3PIZtoQZOG1ejTmihTM',
    annual:           'price_1TPtJCPIZtoQZOG1ASGfg1O9',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ3PIZtoQZOG1wF9TTsCp',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJCPIZtoQZOG15WraIbzd',
  },
  enterprise_starter: {
    name: 'Enterprise Starter',
    amount: 199,
    monthly:          'price_1TPtJ4PIZtoQZOG11t2dnSJJ',
    annual:           'price_1TPtJCPIZtoQZOG1MpqZIpyr',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ4PIZtoQZOG1FUuTbD5w',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJDPIZtoQZOG1j0ObWbtt',
  },
  enterprise_pro: {
    name: 'Enterprise Pro',
    amount: 499,
    monthly:          'price_1TPtJ5PIZtoQZOG1NUp56tn2',
    annual:           'price_1TPtJDPIZtoQZOG114P0ImlG',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ5PIZtoQZOG1t5WrmjrP',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJEPIZtoQZOG1HkIrIPeW',
  },
  enterprise_scale: {
    name: 'Enterprise Scale',
    amount: 999,
    monthly:          'price_1TPtJ5PIZtoQZOG1L0rL7Gx5',
    annual:           'price_1TPtJEPIZtoQZOG18n4tb0ON',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ6PIZtoQZOG1lexZUI2A',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJEPIZtoQZOG1XHCGfiWA',
  },
  csdk_lite: {
    name: 'cSDK Lite',
    amount: 499,
    monthly:          'price_1TPtJ6PIZtoQZOG1JcEY2AT6',
    annual:           'price_1TPtJFPIZtoQZOG1WGXr4Scj',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ7PIZtoQZOG16VqZIpFB',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJFPIZtoQZOG1Mv5SlnWv',
  },
  csdk_pro: {
    name: 'cSDK Pro',
    amount: 999,
    monthly:          'price_1TPtJ7PIZtoQZOG1pwqaxVFI',
    annual:           'price_1TPtJGPIZtoQZOG10iywTn7v',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ7PIZtoQZOG1V27uHCF6',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJGPIZtoQZOG1LBCRGgm4',
  },
  csdk_scale: {
    name: 'cSDK Scale',
    amount: 2999,
    monthly:          'price_1TPtJ8PIZtoQZOG1s9aQdYx8',
    annual:           'price_1TPtJGPIZtoQZOG1ihxNgWEV',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ8PIZtoQZOG17Sc5upCq',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJHPIZtoQZOG1LQu7FQCI',
  },
  ud_signer_solo: {
    name: 'UD Signer Solo',
    amount: 12,
    monthly:          'price_1TPtJ9PIZtoQZOG1JD3wXRXF',
    annual:           'price_1TPtJHPIZtoQZOG1r79Lfort',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJ9PIZtoQZOG1A4bgIZ5c',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJIPIZtoQZOG1bmJGldYr',
  },
  ud_signer_business: {
    name: 'UD Signer Business',
    amount: 29,
    monthly:          'price_1TPtJ9PIZtoQZOG1mUwO7bEg',
    annual:           'price_1TPtJIPIZtoQZOG13xr6j9Rg',
    paymentLink:      'https://buy.stripe.com/plink_1TPtJAPIZtoQZOG1ZYGK1xRK',
    paymentLinkAnnual:'https://buy.stripe.com/plink_1TPtJIPIZtoQZOG1b3pvm940',
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

export function getPaymentLink(tier: string, interval: 'monthly' | 'annual' = 'monthly'): string {
  const price = STRIPE_PRICES[tier]
  if (!price) return 'https://ud.hive.baby/pricing'
  return interval === 'annual'
    ? (price.paymentLinkAnnual ?? price.paymentLink ?? 'https://ud.hive.baby/pricing')
    : (price.paymentLink ?? 'https://ud.hive.baby/pricing')
}

export function getUpgradeUrl(requiredTier: string): string {
  return getPaymentLink(requiredTier, 'monthly')
}

export function formatPrice(tier: string, interval: 'monthly' | 'annual' = 'monthly'): string {
  const price = STRIPE_PRICES[tier]
  if (!price) return ''
  const amount = interval === 'annual' ? Math.round(price.amount * 10 * 0.85) / 10 : price.amount
  return `$${amount}/${interval === 'annual' ? 'year' : 'mo'}`
}
