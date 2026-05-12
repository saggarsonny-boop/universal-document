// Landing page. Plain English, mobile-first, no marketing fluff.
// CTA routes to /signup which captures the age band BEFORE Clerk.
//
// Plain <a> rather than next/link: under Next 16.2.3 + React 19 + Clerk 6 +
// Turbopack, the Link onClick handler preventDefaults the click but never
// triggers router.push (verified with Playwright on prod). Native <a>
// navigation reliably reaches /signup.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { strings } from "./_lib/strings";
import { HiveFooter } from "./_lib/HiveFooter";
import { HiveInstallHint } from "./_lib/HiveInstallHint";
import { HiveFirstVisitExplainer } from "./_lib/HiveFirstVisitExplainer";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    // Signed-in users skip the marketing page and go straight to their
    // profile setup or self-view; setup is idempotent.
    redirect("/profile/setup");
  }

  const s = strings.home;
  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>{s.title}</h1>
      <p style={taglineStyle}>{s.tagline}</p>

      <div style={pillarsStyle}>
        <div style={pillarStyle}>
          <strong style={{ color: PAPER }}>{s.pillars.private.title}</strong>
          <span>{s.pillars.private.body}</span>
        </div>
        <div style={pillarStyle}>
          <strong style={{ color: PAPER }}>{s.pillars.safe.title}</strong>
          <span>{s.pillars.safe.body}</span>
        </div>
        <div style={pillarStyle}>
          <strong style={{ color: PAPER }}>{s.pillars.free.title}</strong>
          <span>{s.pillars.free.body}</span>
        </div>
      </div>

      <a href="/signup" style={ctaStyle} aria-label={s.ctaAria}>
        {s.cta}
      </a>
      <a href="/sign-in" style={signInLinkStyle}>
        {s.signInPrompt}
      </a>

      <HiveInstallHint />
      <HiveFirstVisitExplainer />
      <HiveFooter />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px 20px 0",
  maxWidth: 560,
  margin: "0 auto",
  minHeight: "calc(100dvh - 60px)",
};

const titleStyle: React.CSSProperties = {
  margin: "20px 0 8px",
  fontSize: 30,
  lineHeight: 1.15,
  textAlign: "center",
  color: PAPER,
  fontWeight: 600,
};

const taglineStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  color: MUTED,
  textAlign: "center",
  fontSize: 16,
  lineHeight: 1.5,
};

const pillarsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  marginBottom: 32,
};

const pillarStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "12px 14px",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  fontSize: 14,
  lineHeight: 1.5,
  color: MUTED,
};

const ctaStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 200,
  minHeight: 48,
  padding: "12px 24px",
  background: GOLD,
  color: "#0a0a0a",
  borderRadius: 10,
  fontWeight: 600,
  textDecoration: "none",
  fontSize: 16,
};

const signInLinkStyle: React.CSSProperties = {
  marginTop: 16,
  color: MUTED,
  textDecoration: "underline",
  fontSize: 14,
};
