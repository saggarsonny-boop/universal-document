// Canonical Hive header — full Hive logo links back to hive.baby.
// Sized 32px on mobile, 40px on desktop via a scoped <style> tag so the size
// kicks in on first paint with no client-side layout shift.

const wrapStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "max(env(safe-area-inset-top), 8px)",
  paddingBottom: 8,
};

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: 0,
  margin: 0,
  lineHeight: 0,
};

const HEADER_STYLE = `
.hive-header-logo { height: 48px; width: auto; display: block; }
@media (min-width: 768px) { .hive-header-logo { height: 56px; } }
`;

export function HiveHeader() {
  return (
    <div style={wrapStyle}>
      <style dangerouslySetInnerHTML={{ __html: HEADER_STYLE }} />
      <a
        href="https://hive.baby"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hive ecosystem"
        style={linkStyle}
      >
        <picture>
          <source srcSet="/hive-logo-full.webp?v=8" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hive-logo-full.png?v=8"
            alt="Hive ecosystem"
            className="hive-header-logo"
          />
        </picture>
      </a>
    </div>
  );
}
