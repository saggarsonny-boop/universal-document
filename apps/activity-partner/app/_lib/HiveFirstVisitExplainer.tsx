"use client";

// Engine-local wrapper around @hive/onboarding's HiveFirstVisitExplainer.
// Same pattern as HiveInstallHint — engine-specific copy + slug live here
// so the home page imports a single component with no per-engine config.

import { HiveFirstVisitExplainer as PackageHiveFirstVisitExplainer } from "@/lib/hive-onboarding";
import { useStrings } from "./useStrings";

export function HiveFirstVisitExplainer() {
  const s = useStrings();
  return (
    <PackageHiveFirstVisitExplainer
      engineName="HiveActivityPartner"
      engineSlug="hive-activity-partner"
      customMessage={s.home.firstVisit.body}
    />
  );
}
