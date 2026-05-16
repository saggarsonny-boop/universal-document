// Canonical Hive footer signature: "Made with ♥ in the Hive" with the ♥
// in Hive gold (#D4AF37). The word "Hive" links to https://hive.baby in a
// new tab. Sits below the engine-local disclaimers in app/layout.tsx.

export default function HiveFooter() {
  return (
    <div className="hive-footer-signature" aria-label="Hive ecosystem">
      <p>
        Made with{" "}
        <span style={{ color: "#D4AF37" }} aria-hidden="true">
          ♥
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
      <p className="hive-footer-link-row">
        <a
          href="https://hive.baby"
          target="_blank"
          rel="noopener noreferrer"
        >
          hive.baby
        </a>
        {" · "}
        social experiment
        {" · "}
        <a
          href="https://hive.baby/contribute.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          contribute
        </a>
        {" · "}
        <a
          href="https://hive.baby/patrons.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          patronage
        </a>
        {" · "}
        <a
          href="https://hive.baby/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy
        </a>
      </p>
    </div>
  );
}
