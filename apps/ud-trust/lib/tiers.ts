// Tier definitions for HivePlainScan paywall Phase 1.
//
// Single source of truth for: copy, price (display), feature lists,
// support strings, and the price-lock guarantee language. Imported by
// PricingTiers.tsx, the B2B waitlist landings, the /account dashboard,
// and the entitlement gate.
//
// COPY HYGIENE (Phase 9 of the paywall spec):
//
//   The strings "priority support", "VIP support", "white-glove",
//   "dedicated support", and "premium support" are FORBIDDEN anywhere
//   in the engine. The `forbiddenSupportClaims` array is exported below
//   as the canonical list; HiveOps and CI grep against this set so a
//   future PR can't reintroduce the claim. Today's tiers describe
//   support honestly:
//     - free / pay-per-report  → "Self-serve via FAQ"
//     - individual             → "Email support — FAQ + best-effort
//                                 response"
//     - clinic / practice / enterprise (not yet live) → described per
//                                 tier when BAA template lands.
//
// PRICE-LOCK LANGUAGE: every paid tier surface MUST display
// `priceLockShort` near the CTA and `priceLockFull` somewhere on the
// same view (typically a footer note across the pricing section).
// Wording is intentionally precise: "as long as they maintain their
// subscription without lapses" is the contract. Re-subscribers pay the
// rate active at re-subscription.

export type TierId =
  | "free"
  | "pay-per-report"
  | "individual-monthly"
  | "individual-yearly"
  | "clinic"
  | "practice"
  | "enterprise";

export type TierKind = "consumer" | "b2b-waitlist";

export interface TierDef {
  id: TierId;
  kind: TierKind;
  /** Display name on the pricing card. */
  name: string;
  /** Short tagline rendered under the price. */
  tagline: string;
  /** Price label as humans read it. The actual amount lives in Stripe;
   *  this is just for display. */
  priceLabel: string;
  /** Sub-label below price for billing cadence ("USD one-time", "/month",
   *  "/year (15% off)", "Q2 2026 — Join Waitlist"). */
  priceSubLabel: string;
  /** Feature list bullets. Plain language only. No marketing fluff. */
  features: string[];
  /** Support description. Must NOT match any of `forbiddenSupportClaims`
   *  (CI grep enforces). */
  support: string;
  /** CTA button label. */
  ctaLabel: string;
  /** Where the CTA goes: a Stripe checkout for paid consumer tiers, the
   *  matching `/clinic` / `/practice` / `/enterprise` waitlist page for
   *  B2B, or the engine homepage for free. */
  ctaHref: string;
  /** Stripe Price ID — populated for consumer paid tiers via the
   *  provisioning workflow. `null` for free + B2B-waitlist tiers. */
  stripePriceIdEnv: string | null;
  /** When `true`, the card shows the price-lock short label next to its
   *  CTA. All paid tiers should set this; free + B2B-waitlist do not. */
  showPriceLock: boolean;
}

export const TIERS: ReadonlyArray<TierDef> = [
  {
    id: "free",
    kind: "consumer",
    name: "Free",
    tagline: "Try HivePlainScan with up to 4 reports.",
    priceLabel: "$0",
    priceSubLabel: "4 reports, lifetime",
    features: [
      "4 free reports per device",
      "AI plain-English explanation",
      "Medical illustration (when available)",
      "UDS download with chain-of-custody",
      "PDF download",
      "Personal-use only",
    ],
    support: "Self-serve via FAQ",
    ctaLabel: "Try free",
    ctaHref: "/plainscan",
    stripePriceIdEnv: null,
    showPriceLock: false,
  },
  {
    id: "pay-per-report",
    kind: "consumer",
    name: "Pay-per-report",
    tagline: "One report, one payment.",
    priceLabel: "$4.99",
    priceSubLabel: "USD one-time",
    features: [
      "1 report explanation",
      "Same AI quality as Individual",
      "Medical illustration included",
      "UDS download with chain-of-custody",
      "PDF download",
      "30-day access window",
      "No account required",
    ],
    support: "Self-serve via FAQ",
    ctaLabel: "Buy one report",
    ctaHref: "/api/checkout?tier=pay-per-report",
    stripePriceIdEnv: "STRIPE_PRICE_HPS_PAY_PER_REPORT",
    showPriceLock: false,
  },
  {
    id: "individual-monthly",
    kind: "consumer",
    name: "Individual",
    tagline: "Unlimited personal-use reports.",
    priceLabel: "$9.99",
    priceSubLabel: "/month, billed monthly",
    features: [
      "Unlimited reports while subscribed",
      "Same AI quality as Pay-per-report",
      "Medical illustration included",
      "UDS download with chain-of-custody",
      "PDF download",
      "Cancel any time from the account page",
      "Personal-use only",
    ],
    support: "Email support — FAQ + best-effort response",
    ctaLabel: "Subscribe — $9.99/mo",
    ctaHref: "/api/checkout?tier=individual-monthly",
    stripePriceIdEnv: "STRIPE_PRICE_HPS_INDIVIDUAL_MONTHLY",
    showPriceLock: true,
  },
  {
    id: "individual-yearly",
    kind: "consumer",
    name: "Individual (Annual)",
    tagline: "Same plan, billed yearly. ~25% off.",
    priceLabel: "$89",
    priceSubLabel: "/year (≈ $7.42/mo)",
    features: [
      "Unlimited reports while subscribed",
      "All Individual features",
      "Single annual charge",
      "Cancel any time from the account page",
      "Personal-use only",
    ],
    support: "Email support — FAQ + best-effort response",
    ctaLabel: "Subscribe — $89/yr",
    ctaHref: "/api/checkout?tier=individual-yearly",
    stripePriceIdEnv: "STRIPE_PRICE_HPS_INDIVIDUAL_YEARLY",
    showPriceLock: true,
  },
  {
    id: "clinic",
    kind: "b2b-waitlist",
    name: "Clinic",
    tagline: "For small clinical groups.",
    priceLabel: "TBD",
    priceSubLabel: "Coming Q2 2026 — Join Waitlist",
    features: [
      "Up to 10 named clinicians",
      "Per-seat unlimited reports",
      "BAA-covered data handling (when available)",
      "Email + scheduled-call onboarding",
      "Reporting + usage exports",
      "Multi-seat billing",
    ],
    support: "Email support during onboarding",
    ctaLabel: "Join waitlist",
    ctaHref: "/clinic",
    stripePriceIdEnv: null,
    showPriceLock: false,
  },
  {
    id: "practice",
    kind: "b2b-waitlist",
    name: "Practice",
    tagline: "For mid-size practices.",
    priceLabel: "TBD",
    priceSubLabel: "Coming Q2 2026 — Join Waitlist",
    features: [
      "Up to 50 named clinicians",
      "Per-seat unlimited reports",
      "BAA-covered data handling (when available)",
      "Onboarding workshop + admin training",
      "Custom reporting cadence",
      "SSO (SAML / OIDC) on launch",
    ],
    support: "Email + scheduled-call support",
    ctaLabel: "Join waitlist",
    ctaHref: "/practice",
    stripePriceIdEnv: null,
    showPriceLock: false,
  },
  {
    id: "enterprise",
    kind: "b2b-waitlist",
    name: "Enterprise",
    tagline: "Custom deployment for health systems.",
    priceLabel: "Custom",
    priceSubLabel: "Coming Q2 2026 — Join Waitlist",
    features: [
      "Unlimited seats",
      "Per-org unlimited reports",
      "BAA-covered data handling (when available)",
      "Dedicated infrastructure deployment options",
      "Custom integrations + data residency",
      "SLA on availability",
    ],
    support: "Email + scheduled-call support",
    ctaLabel: "Join waitlist",
    ctaHref: "/enterprise",
    stripePriceIdEnv: null,
    showPriceLock: false,
  },
];

export const CONSUMER_TIERS: ReadonlyArray<TierDef> = TIERS.filter(
  (t) => t.kind === "consumer",
);
export const B2B_WAITLIST_TIERS: ReadonlyArray<TierDef> = TIERS.filter(
  (t) => t.kind === "b2b-waitlist",
);

export function tierById(id: TierId): TierDef | undefined {
  return TIERS.find((t) => t.id === id);
}

// ─── Price-lock guarantee language ─────────────────────────────────────

export const priceLockShort = "Lock in this rate when you subscribe today.";

export const priceLockFull =
  "Pricing may change at any time. Active subscribers are locked at their original rate for as long as they maintain their subscription without lapses. If your subscription lapses or is canceled, returning customers will pay the rate active at re-subscription.";

// ─── Free-tier policy ──────────────────────────────────────────────────

/** Lifetime free-report cap per device (per the paywall Phase 1 spec).
 *  Enforced by lib/entitlements.ts via a localStorage counter on the
 *  client + a fingerprint-keyed `hps_free_usage` row server-side. */
export const FREE_REPORT_LIMIT = 4;

/** Threshold at which the upgrade CTA becomes prominent. Used by the
 *  homepage usage-counter banner. */
export const FREE_REPORT_UPGRADE_CTA_AT = 3;

// ─── Copy hygiene guard rail ───────────────────────────────────────────

/** Strings forbidden anywhere in HivePlainScan user-facing copy. CI
 *  grep enforcement runs against this set in the HiveOps audit step.
 *  Keep lowercase; CI matches case-insensitive. */
export const forbiddenSupportClaims: ReadonlyArray<string> = [
  "priority support",
  "vip support",
  "white-glove",
  "white glove",
  "dedicated support",
  "premium support",
  "lifetime tier",
  "lifetime access",
];
