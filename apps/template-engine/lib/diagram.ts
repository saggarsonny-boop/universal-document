// SVG diagram fallback — used when REPLICATE_API_TOKEN is absent or the
// FLUX call fails. Renders a region-aware educational illustration directly
// in the response (no image generation step). Returns a data: URL so the
// client can drop it straight into <img src="">.
//
// Three diagram families: spine (sagittal + axial inset), joint, organ.
// Falls through to a generic shell for body regions not covered.

import type { ExplainResult, Finding } from "@/types/plainscan";

interface FindingCard {
  color: string;
  level: string;
  title: string;
  lines: string[];
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

const PALETTE = ["#1f7a2d", "#0b61a4", "#7542a8", "#e9650b", "#b83280"];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function labelLines(text: string, max = 30, limit = 5): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, limit);
}

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function levelFromFinding(finding: Finding, fallback: string): string {
  const combined = `${finding.level || ""} ${finding.finding} ${finding.plainLanguage}`;
  return (
    combined.match(/\b(?:C|T|L|S)\d(?:[-/](?:C|T|L|S)?\d)?\b/i)?.[0].toUpperCase() ||
    fallback
  );
}

function spineKind(result: ExplainResult): "cervical" | "lumbar" {
  const combined = `${result.bodyRegion} ${result.reportType} ${result.findings
    .map((f) => `${f.level || ""} ${f.finding} ${f.plainLanguage}`)
    .join(" ")}`;
  if (/\bC\d(?:[-/](?:C)?\d)?\b/i.test(combined) || /cervical/i.test(combined))
    return "cervical";
  return "lumbar";
}

function normalizeLevel(level: string): string {
  return level.replace(/([CTL])(\d)-(?=\d)/i, "$1$2-$1").toUpperCase();
}

function findingCards(
  result: ExplainResult,
  kind: "cervical" | "lumbar",
): FindingCard[] {
  const defaults =
    kind === "cervical"
      ? ["C3-C4", "C4-C5", "C5-C6", "C6-C7"]
      : ["L2-L3", "L3-L4", "L4-L5", "L5-S1"];
  const grouped = new Map<string, Finding[]>();

  for (const f of result.findings) {
    const level = normalizeLevel(levelFromFinding(f, defaults[grouped.size] || "Finding"));
    grouped.set(level, [...(grouped.get(level) || []), f]);
  }

  const selected = [...grouped.entries()].slice(0, 4);
  return selected.map(([level, group], index) => {
    const terms = [
      ...new Set(group.map((g) => g.finding).filter(Boolean)),
    ].slice(0, 4);
    const severe = group.find((g) => g.severity !== "not specified")?.severity;
    const summary = `${severe ? `${severe} ` : ""}${terms.join(", ") || "reported finding"}`;
    const sideNote = group
      .map((g) => g.plainLanguage)
      .find((t) => /cord|canal|foraminal|nerve|facet|disc/i.test(t));
    const yTargets = kind === "cervical" ? [206, 320, 438, 552] : [214, 336, 476, 618];
    return {
      color: PALETTE[index % PALETTE.length],
      level,
      title: summary,
      lines: labelLines(`${summary}. ${sideNote || ""}`, 27, 4),
      x: 48,
      y: 112 + index * 166,
      targetX: 524,
      targetY: yTargets[index] || 438,
    };
  });
}

function defs(): string {
  return `
    <defs>
      <linearGradient id="bone" x1="0" x2="1">
        <stop offset="0" stop-color="#fff7ea"/>
        <stop offset="0.25" stop-color="#efd7b8"/>
        <stop offset="0.62" stop-color="#caa67b"/>
        <stop offset="1" stop-color="#fff1dc"/>
      </linearGradient>
      <radialGradient id="boneCore" cx="50%" cy="45%" r="62%">
        <stop offset="0" stop-color="#f9ecd8"/>
        <stop offset="0.6" stop-color="#d7b58a"/>
        <stop offset="1" stop-color="#9d7b5d"/>
      </radialGradient>
      <linearGradient id="disc" x1="0" x2="1">
        <stop offset="0" stop-color="#e5edf7"/>
        <stop offset="0.35" stop-color="#aebdd2"/>
        <stop offset="0.7" stop-color="#65768e"/>
        <stop offset="1" stop-color="#eef5fd"/>
      </linearGradient>
      <linearGradient id="softTissue" x1="0" x2="1">
        <stop offset="0" stop-color="#f2f0ed"/>
        <stop offset="0.45" stop-color="#cbc8c5"/>
        <stop offset="1" stop-color="#8f949c"/>
      </linearGradient>
      <linearGradient id="nerve" x1="0" x2="1">
        <stop offset="0" stop-color="#fff6a8"/>
        <stop offset="0.5" stop-color="#f2c94c"/>
        <stop offset="1" stop-color="#9b6f0f"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#101828" flood-opacity="0.22"/>
      </filter>
    </defs>`;
}

function callout(card: FindingCard): string {
  const textX = card.x + 20;
  const connectorStartX = card.x < 700 ? card.x + 310 : card.x;
  return `
    <rect x="${card.x}" y="${card.y}" width="320" height="138" rx="12" fill="#ffffff" stroke="${card.color}" stroke-width="3"/>
    <text x="${textX}" y="${card.y + 34}" font-family="Arial, sans-serif" font-size="29" font-weight="800" fill="${card.color}">${escapeXml(card.level)}:</text>
    ${card.lines
      .map(
        (line, i) =>
          `<text x="${textX}" y="${card.y + 62 + i * 22}" font-family="Arial, sans-serif" font-size="17" fill="#111827">${escapeXml(line)}</text>`,
      )
      .join("")}
    <path d="M${connectorStartX} ${card.y + 72} L${card.targetX} ${card.targetY}" fill="none" stroke="${card.color}" stroke-width="4"/>
    <circle cx="${card.targetX}" cy="${card.targetY}" r="9" fill="${card.color}" stroke="#ffffff" stroke-width="3"/>`;
}

function vertebra(y: number, label: string, scale = 1): string {
  const h = 92 * scale;
  return `
    <g filter="url(#softShadow)">
      <path d="M520 ${y} C560 ${y - 16} 644 ${y - 12} 674 ${y + 10} C660 ${y + h} 578 ${y + h + 16} 512 ${y + h - 2} C508 ${y + h - 2} 516 ${y + 10} 520 ${y}Z" fill="url(#bone)" stroke="#775f49" stroke-width="3.5"/>
      <path d="M535 ${y + 12} C572 ${y + 2} 631 ${y + 5} 655 ${y + 21} C642 ${y + h - 14} 580 ${y + h - 6} 530 ${y + h - 14} C526 ${y + h - 14} 531 ${y + 24} 535 ${y + 12}Z" fill="url(#boneCore)" opacity="0.72"/>
    </g>
    <text x="452" y="${y + 58}" text-anchor="middle" font-family="Arial, sans-serif" font-size="35" font-weight="800" fill="#08111f">${label}</text>`;
}

function disc(y: number, highlight = false): string {
  return `
    <path d="M512 ${y} C552 ${y - 15} 636 ${y - 14} 680 ${y + 2} C674 ${y + 31} 536 ${y + 40} 500 ${y + 17} C502 ${y + 9} 505 ${y + 3} 512 ${y}Z" fill="url(#disc)" stroke="#46566d" stroke-width="3.5"/>
    ${highlight ? `<path d="M646 ${y + 2} C690 ${y + 8} 707 ${y + 27} 687 ${y + 47}" fill="none" stroke="#cc1f1a" stroke-width="5.5"/>` : ""}`;
}

function footer(yPos = 1042): string {
  return `<text x="725" y="${yPos}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-style="italic" fill="#3f4b5f">Educational illustration based on report text - not an actual image and not to scale.</text>`;
}

function spineDiagram(result: ExplainResult): string {
  const kind = spineKind(result);
  const cards = findingCards(result, kind);
  const titleRegion = kind === "cervical" ? "Cervical Spine" : "Lumbar Spine";
  const levelLabels =
    kind === "cervical"
      ? ["C3", "C4", "C5", "C6", "C7"]
      : ["L2", "L3", "L4", "L5", "S1"];
  const body = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1450 1080" role="img" aria-label="${escapeXml(titleRegion)} report findings illustration">
  ${defs()}
  <rect width="1450" height="1080" fill="#ffffff"/>
  <text x="725" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#071126">${escapeXml(titleRegion)} ${escapeXml(result.reportType || "Imaging")} Findings (Sagittal View)</text>
  ${vertebra(76, levelLabels[0])}
  ${disc(183, cards.length > 0)}
  ${vertebra(210, levelLabels[1], 1.08)}
  ${disc(330, cards.length > 1)}
  ${vertebra(358, levelLabels[2], 1.08)}
  ${disc(480, cards.length > 2)}
  ${vertebra(510, levelLabels[3], 1.05)}
  ${disc(625, cards.length > 3)}
  ${vertebra(655, levelLabels[4], 1.18)}
  ${cards.map(callout).join("")}
  ${footer()}
</svg>`;
  return encodeSvg(body);
}

function simpleShell(title: string, anatomy: string, result: ExplainResult): string {
  const findings = result.findings.slice(0, 4);
  const body = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1450 900" role="img" aria-label="${escapeXml(title)}">
  ${defs()}
  <rect width="1450" height="900" fill="#ffffff"/>
  <text x="725" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#071126">${escapeXml(title)}</text>
  ${anatomy}
  ${findings
    .map((f, i) => {
      const x = i % 2 === 0 ? 74 : 1068;
      const y = 126 + Math.floor(i / 2) * 210;
      const color = PALETTE[i % PALETTE.length];
      return `
        <rect x="${x}" y="${y}" width="310" height="156" rx="14" fill="#ffffff" stroke="${color}" stroke-width="3"/>
        <text x="${x + 22}" y="${y + 38}" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="${color}">${escapeXml(f.finding || "Finding")}</text>
        ${labelLines(f.plainLanguage, 32, 4)
          .map(
            (line, li) =>
              `<text x="${x + 22}" y="${y + 72 + li * 24}" font-family="Arial, sans-serif" font-size="19" fill="#111827">${escapeXml(line)}</text>`,
          )
          .join("")}`;
    })
    .join("")}
  ${footer(862)}
</svg>`;
  return encodeSvg(body);
}

function jointDiagram(result: ExplainResult): string {
  const anatomy = `
    <circle cx="725" cy="430" r="230" fill="#f8fbff" stroke="#0b61a4" stroke-width="4"/>
    <path d="M570 360 C630 270 810 270 880 360" fill="none" stroke="url(#bone)" stroke-width="58" stroke-linecap="round"/>
    <path d="M570 515 C640 610 812 610 882 515" fill="none" stroke="url(#bone)" stroke-width="58" stroke-linecap="round"/>
    <text x="725" y="710" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">Simplified joint diagram with report findings highlighted</text>`;
  return simpleShell("Joint Imaging Findings", anatomy, result);
}

function organDiagram(result: ExplainResult): string {
  const anatomy = `
    <path d="M640 170 C520 250 520 540 680 628 C802 694 976 630 1015 472 C1058 298 918 116 742 118 C704 118 670 136 640 170Z" fill="#eef6ff" stroke="#0b61a4" stroke-width="5"/>
    <text x="770" y="710" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">Simplified organ-region map, not an anatomical diagnosis</text>`;
  return simpleShell("Body Region Imaging Findings", anatomy, result);
}

function generalDiagram(result: ExplainResult): string {
  const anatomy = `
    <rect x="572" y="170" width="310" height="420" rx="50" fill="#eef6ff" stroke="#0b61a4" stroke-width="5"/>
    <text x="727" y="682" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">General educational map based on the report text</text>`;
  return simpleShell("Educational Imaging Findings", anatomy, result);
}

/** Return a data: URL containing an SVG diagram suited to the body region. */
export function buildDiagramSvg(result: ExplainResult): string {
  const region = (result.bodyRegion || "").toLowerCase();
  if (region.includes("spine") || region.includes("lumbar") || region.includes("cervical")) {
    return spineDiagram(result);
  }
  if (["knee", "shoulder", "hip"].some((p) => region.includes(p))) {
    return jointDiagram(result);
  }
  if (["chest", "abdomen", "brain"].some((p) => region.includes(p))) {
    return organDiagram(result);
  }
  return generalDiagram(result);
}
