"use client";

// Engine-local wrapper around @hive/onboarding's HiveInstallHint. Holds
// HiveActivityPartner-specific copy + engine-slug config in one place so
// surface-level files can render the canonical Hive install hint with one
// import.

import { HiveInstallHint as PackageHiveInstallHint } from "@/lib/hive-onboarding";
import { useStrings } from "./useStrings";

export function HiveInstallHint() {
  const s = useStrings();
  return (
    <PackageHiveInstallHint
      engineName="HiveActivityPartner"
      engineSlug="hive-activity-partner"
      customMessage={s.home.install.banner}
    />
  );
}
