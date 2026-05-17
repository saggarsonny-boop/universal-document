"use client";

import React from "react";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const MUTED = "#9a9588";

const linkBase: React.CSSProperties = {
  color: MUTED,
  textDecoration: "none",
  borderBottom: `1px dotted ${MUTED}`,
  paddingBottom: 1,
};

const dotStyle: React.CSSProperties = {
  color: GOLD_DIM,
  margin: "0 6px",
};

const sigLinkStyle: React.CSSProperties = {
  color: MUTED,
  textDecoration: "none",
  borderBottom: `1px dotted ${MUTED}`,
};

const sigHeartStyle: React.CSSProperties = {
  color: GOLD,
  margin: "0 4px",
};

const HiveMark = ({ size = 20 }: { size?: number }) => (
  <svg
    viewBox="0 0 100 86.6"
    width={size}
    height={Math.round((size * 86.6) / 100)}
    role="img"
    aria-label="Hive"
    style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}
  >
    <defs>
      <linearGradient id="hap-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE6A1" />
        <stop offset="40%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#5e4a0d" />
      </linearGradient>
      <radialGradient id="hap-face" cx="32%" cy="28%" r="85%">
        <stop offset="0%" stopColor="#FFD96E" />
        <stop offset="55%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#a07f15" />
      </radialGradient>
    </defs>
    <polygon
      points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
      fill="url(#hap-rim)" stroke="#8a6f1f" strokeWidth="0.6"
      strokeLinejoin="round" vectorEffect="non-scaling-stroke"
    />
    <polygon
      points="28.50,6.06 71.50,6.06 96.50,43.30 71.50,80.54 28.50,80.54 3.50,43.30"
      fill="url(#hap-face)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4"
      strokeLinejoin="round" vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export function HiveFooter() {
  return (
    <footer style={footerStyle}>
      <nav style={linkRowStyle} aria-label="Hive links">
        <a href="https://hive.baby" target="_blank" rel="noopener noreferrer" style={linkBase}>
          hive.baby
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/about" target="_blank" rel="noopener noreferrer" style={linkBase}>
          social experiment
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/contribute" target="_blank" rel="noopener noreferrer" style={linkBase}>
          contribute
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/patrons" target="_blank" rel="noopener noreferrer" style={linkBase}>
          patronage
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/privacy" target="_blank" rel="noopener noreferrer" style={linkBase}>
          privacy
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/governance" target="_blank" rel="noopener noreferrer" style={linkBase}>
          queen bee governance
        </a>
        <span style={dotStyle}>·</span>
        <a href="https://hive.baby/amplifiers" target="_blank" rel="noopener noreferrer" style={linkBase}>
          adoption amplifiers
        </a>
      </nav>

      <div style={signatureRowStyle} aria-label="Made with love in the Hive">
        <HiveMark size={20} />
        <span style={signatureTextStyle}>
          Made with
          <span style={sigHeartStyle} aria-hidden="true">♥</span>
          in the
          <a
            href="https://hive.baby"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...sigLinkStyle, marginLeft: "4px" }}
          >
            Hive
          </a>
        </span>
      </div>
    </footer>
  );
}

const footerStyle: React.CSSProperties = {
  marginTop: 40,
  color: MUTED,
  fontSize: 11,
  letterSpacing: "0.05em",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  lineHeight: 1.6,
  padding: "40px 16px 80px",
  textAlign: "center",
  borderTop: "1px solid rgba(255,255,255,0.05)",
  backgroundColor: "#050505",
};

const linkRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: 0,
  fontSize: 11,
};

const signatureRowStyle: React.CSSProperties = {
  marginTop: 8,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const signatureTextStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.03em",
  color: MUTED,
  lineHeight: 1.4,
  display: "flex",
  alignItems: "center",
};
