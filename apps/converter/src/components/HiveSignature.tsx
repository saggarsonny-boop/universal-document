// HIVE_FOOTER_SIGNATURE — canonical "Made with ♥ in the Hive" row.
//
// Sits below UDFooter so the UD-branded primary footer remains the
// dominant footer surface, with a small Hive ecosystem signature
// underneath as the canonical brand-integration item per
// docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md (HiveOps rule H14).
//
// "Made with" and "in the" are intentionally English here — the brand
// name "Hive" stays English everywhere, and the surrounding two-word
// phrases are short enough that the visual recognition wins (the gold
// ♥ glyph is the eye-catch, not the localized verb). When this engine
// adopts the canonical @hive/onboarding HiveFooter primitive, the
// per-locale string variants kick in automatically.

const GOLD = "#D4AF37";

export default function HiveSignature() {
  return (
    <div
      role="contentinfo"
      aria-label="Hive ecosystem signature"
      style={{
        textAlign: "center",
        padding: "20px 16px 28px",
        fontSize: 12,
        color: "var(--ud-muted)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.04em",
        background: "var(--ud-paper-2, #f2f1ee)",
        borderTop: "1px solid var(--ud-border)",
      }}
    >
      <span>Made with </span>
      <span aria-label="love" style={{ color: GOLD, fontSize: 14, lineHeight: 1 }}>
        ♥
      </span>
      <span> in the </span>
      <a
        href="https://hive.baby"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--ud-ink)",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Hive
      </a>
    </div>
  );
}
