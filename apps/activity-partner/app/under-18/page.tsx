// Friction page for under-18s. We don't sign them up — but we don't dump
// them with a cold "no". Real safety resources, parent-friendly framing.

import Link from "next/link";
import { strings } from "../_lib/strings";
import { HiveFooter } from "../_lib/HiveFooter";

const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

export default function Under18() {
  const s = strings.under18;
  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>{s.title}</h1>
      <p style={leadStyle}>{s.lead}</p>

      <h2 style={subTitleStyle}>{s.resourcesTitle}</h2>
      <ul style={listStyle}>
        <li>
          <a href="https://www.commonsensemedia.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Common Sense Media
          </a>
          {" — "}{s.resources.commonSense}
        </li>
        <li>
          <a href="https://www.connectsafely.org/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            ConnectSafely
          </a>
          {" — "}{s.resources.connectSafely}
        </li>
        <li>
          <a href="https://www.thinkuknow.co.uk/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Thinkuknow (UK)
          </a>
          {" — "}{s.resources.thinkuknow}
        </li>
      </ul>

      <p style={parentNoteStyle}>{s.parentNote}</p>

      <Link href="/" style={backLinkStyle}>{s.back}</Link>
      <HiveFooter />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "16px 20px 0",
};

const titleStyle: React.CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 24,
  color: PAPER,
  fontWeight: 600,
};

const leadStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.55,
};

const subTitleStyle: React.CSSProperties = {
  marginTop: 24,
  marginBottom: 8,
  fontSize: 16,
  color: PAPER,
  fontWeight: 600,
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: MUTED,
  fontSize: 14,
  lineHeight: 1.65,
};

const linkStyle: React.CSSProperties = {
  color: "#D4AF37",
  textDecoration: "underline",
};

const parentNoteStyle: React.CSSProperties = {
  marginTop: 24,
  padding: "12px 14px",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  color: MUTED,
  fontSize: 13,
  lineHeight: 1.5,
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 24,
  color: MUTED,
  textDecoration: "underline",
  fontSize: 13,
};
