import { B2BTierLanding } from "@/components/B2BTierLanding";
import { tierById } from "@/lib/tiers";

export const metadata = {
  title: "HivePlainScan Clinic â€” Coming Q2 2026 â€” Join Waitlist",
  description:
    "HivePlainScan Clinic â€” for small clinical groups. Up to 10 named clinicians, per-seat unlimited reports, BAA-covered data handling. Join the waitlist; we'll notify you when it launches.",
};

export default function ClinicPage() {
  const tier = tierById("clinic")!;
  return <B2BTierLanding tier={tier} />;
}
