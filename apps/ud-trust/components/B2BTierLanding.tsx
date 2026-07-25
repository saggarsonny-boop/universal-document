// @ts-nocheck
// Shared B2B-tier landing layout. Used by app/clinic/page.tsx,
// app/practice/page.tsx, app/enterprise/page.tsx. Each tier passes the
// same TierDef from lib/tiers.ts and the layout renders a description,
// the feature list, and the WaitlistForm.

import type { TierDef } from "@/lib/tiers";
import { priceLockFull } from "@/lib/tiers";
import { WaitlistForm } from "@/components/WaitlistForm";

const HIVE_GOLD = "#D4AF37";
const HIVE_INK = "#0a0a0a";

interface Props {
  tier: TierDef;
}

export function B2BTierLanding({ tier }: Props) {
  if (tier.kind !== "b2b-waitlist") {
    return null;
  }
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "32px 20px 80px",
        color: HIVE_INK,
        lineHeight: 1.6,
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#5a5e66",
          }}
        >
          HivePlainScan {tier.name}
        </p>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {tier.tagline}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: HIVE_GOLD,
            fontWeight: 600,
          }}
        >
          {tier.priceSubLabel}
        </p>
      </header>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>What&apos;s in {tier.name}</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {tier.features.map((f) => (
            <li key={f} style={{ marginBottom: 6 }}>{f}</li>
          ))}
        </ul>
        <p style={{ marginTop: 14, fontSize: 13, color: "#5a5e66" }}>
          Support during onboarding: {tier.support}.
        </p>
      </section>

      <section
        style={{
          padding: 20,
          background: "rgba(212, 175, 55, 0.07)",
          border: `1px solid ${HIVE_GOLD}`,
          borderRadius: 16,
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Join the waitlist</h2>
        <p style={{ margin: "0 0 16px", fontSize: 14 }}>
          We&apos;ll notify you the moment {tier.name} opens. The exact pricing
          you see today is provisional â€” final pricing is set at launch and
          you&apos;ll be offered the rate that&apos;s active at that moment.
        </p>
        <WaitlistForm tierSlug={tier.id as "clinic" | "practice" | "enterprise"} tierName={tier.name} />
      </section>

      <section
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "#5a5e66",
          lineHeight: 1.6,
          maxWidth: 600,
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Pricing guarantee</p>
        <p style={{ margin: 0 }}>{priceLockFull}</p>
      </section>
    </main>
  );
}
