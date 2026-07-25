// @ts-nocheck
// Canonical Hive footer signature: "Made with   in the Hive" with the  
// in Hive gold (#D4AF37). The word "Hive" links to https://hive.baby in a
// new tab. Sits below the engine-local disclaimers in app/layout.tsx.

export default function HiveFooter() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "48px 24px 32px",
      gap: "12px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "13px",
      color: "#64748b",
      width: "100%",
      boxSizing: "border-box"
    }} aria-label="Hive ecosystem">
      <p style={{ margin: 0 }}>
        Made with{" "}
        <span style={{ color: "#D4AF37" }} aria-hidden="true">
          {"\u2665"}
        </span>{" "}
        in the{" "}
        <a
          href="https://hive.baby"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Hive
        </a>
      </p>
      <p style={{ margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px", lineHeight: "1.6" }}>
        <a
          href="https://hive.baby"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          hive.baby
        </a>
        <span>{"\u00B7"}</span>
        <span>social experiment</span>
        <span>{"\u00B7"}</span>
        <a
          href="https://hive.baby/contribute.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          contribute
        </a>
        <span>{"\u00B7"}</span>
        <a
          href="https://hive.baby/patrons.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          patronage
        </a>
        <span>{"\u00B7"}</span>
        <a
          href="https://hive.baby/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          privacy
        </a>
        <span>{"\u00B7"}</span>
        <a href="https://converter.hive.baby" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#D4AF37", opacity: 0.9, textDecoration: "none", verticalAlign: "middle" }}>
          <img src="/ud-logo-micro.png" width="14" height="14" alt="UD" style={{ borderRadius: "3px" }} />
          Try UD Converter {"\u2014"} Free {"\u2192"}
        </a>
      </p>
    </div>
  );
}
