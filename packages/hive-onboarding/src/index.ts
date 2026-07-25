// @hive/onboarding — public API.
//
// Components:
export { HiveInstallHint } from "./HiveInstallHint";
export type { HiveInstallHintProps } from "./HiveInstallHint";

export { HiveFirstVisitExplainer, dismissHiveFirstVisitExplainer } from "./HiveFirstVisitExplainer";
export type { HiveFirstVisitExplainerProps } from "./HiveFirstVisitExplainer";

export { HiveAHTSPrompt } from "./HiveAHTSPrompt";
export type { HiveAHTSPromptProps } from "./HiveAHTSPrompt";

// Internal-but-public — engines can import these directly if they want
// to compose their own onboarding flows on top of the primitives.
export { InstallCTA } from "./InstallCTA";
export type { InstallCTAProps } from "./InstallCTA";

export { IOSInstallOverlay } from "./IOSInstallOverlay";
export type { IOSInstallOverlayProps } from "./IOSInstallOverlay";

// Hooks:
export { useInstallPrompt, usePlatform } from "./useInstallPrompt";
export type { InstallPlatform, InstallTriggerResult } from "./useInstallPrompt";

export { useDismissalState } from "./useDismissalState";
export type { DismissalState, UseDismissalStateOptions } from "./useDismissalState";

// i18n:
export {
  useStrings,
  getStringsSync,
  setLocaleOverrides,
  pickLocale,
  applyVars,
  applyVarsDeep,
  CANONICAL_LOCALES,
} from "./i18n";
export type { Strings, LocaleCode, StringVars } from "./i18n";
