import { B2BTierLanding } from "@/components/B2BTierLanding";
import { tierById } from "@/lib/tiers";

export const metadata = {
  title: "HivePlainScan Practice â€” Coming Q2 2026 â€” Join Waitlist",
  description:
    "HivePlainScan Practice â€” for mid-size practices. Up to 50 named clinicians, per-seat unlimited reports, SSO on launch. Join the waitlist; we'll notify you when it opens.",
};

export default function PracticePage() {
  const tier = tierById("practice")!;
  return <B2BTierLanding tier={tier} />;
}
