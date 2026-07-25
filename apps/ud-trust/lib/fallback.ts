// Rule-based fallback — runs when ANTHROPIC_API_KEY is absent or the LLM
// call fails. Maps the report's surface terms to a plain-English glossary
// + flags urgent terms as red flags. Returns the canonical ExplainResult
// shape so the API route can hand it back to the client unchanged.

import type { ExplainResult, Finding, Severity } from "@/types/plainscan";

interface GlossaryEntry {
  term: string;
  regex: RegExp;
  plain: string;
  doctorQuestion: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: "stenosis",
    regex: /\b(?:central canal )?stenosis\b/i,
    plain: "Narrowing of a space where nerves travel.",
    doctorQuestion:
      "How much narrowing is present, and does it match my symptoms?",
  },
  {
    term: "disc bulge",
    regex: /\b(?:disc bulg(?:e|ing)|disc protrusion|protrusion)\b/i,
    plain:
      "A spinal disc is pushing outward, often from wear-and-tear changes.",
    doctorQuestion: "Is the disc bulge touching or irritating a nerve?",
  },
  {
    term: "herniation",
    regex: /\bherniat(?:ion|ed)\b/i,
    plain: "Part of a disc has pushed out farther than usual.",
    doctorQuestion:
      "Is the herniation expected to improve, and what symptoms should I watch for?",
  },
  {
    term: "spondylolisthesis",
    regex: /\bspondylolisthesis\b/i,
    plain:
      "One spinal bone has slipped slightly compared with the bone next to it.",
    doctorQuestion:
      "Is the slipping stable, and are follow-up images needed?",
  },
  {
    term: "facet arthritis",
    regex: /\b(?:facet arthropathy|facet arthritis|facet hypertrophy)\b/i,
    plain:
      "Small joints in the back of the spine show arthritis or wear-and-tear change.",
    doctorQuestion: "Could facet arthritis be contributing to my pain?",
  },
  {
    term: "degenerative changes",
    regex: /\bdegenerative\b/i,
    plain: "Wear-and-tear changes are described in the report.",
    doctorQuestion: "Are these changes typical for my age and history?",
  },
  {
    term: "foraminal narrowing",
    regex: /\bforaminal (?:narrowing|stenosis)\b/i,
    plain: "The opening where a nerve exits is narrowed.",
    doctorQuestion:
      "Which nerve opening is narrowed, and could that explain symptoms in my arm or leg?",
  },
  {
    term: "nerve root compression",
    regex: /\b(?:nerve root|root) (?:compression|impingement|contact)\b/i,
    plain: "The report describes pressure on or contact with a nerve.",
    doctorQuestion:
      "Does the nerve finding match my pain, numbness, tingling, or weakness?",
  },
  {
    term: "effusion",
    regex: /\beffusion\b/i,
    plain: "Extra fluid is present in or around a joint or body space.",
    doctorQuestion: "What might be causing the extra fluid?",
  },
  {
    term: "edema",
    regex: /\bedema\b/i,
    plain: "Swelling or extra fluid is seen in the tissue.",
    doctorQuestion: "What does the swelling suggest in my situation?",
  },
  {
    term: "tear",
    regex: /\btear\b/i,
    plain:
      "A structure such as a tendon, ligament, cartilage, or muscle may be partly or fully torn.",
    doctorQuestion:
      "Is the tear partial or complete, and what activities should I avoid until follow-up?",
  },
  {
    term: "mass",
    regex: /\bmass\b(?!\s+effect)/i,
    plain:
      "The report describes an area or growth that needs clinical follow-up.",
    doctorQuestion:
      "What follow-up testing or specialist visit is recommended?",
  },
  {
    term: "nodule",
    regex: /\bnodule\b/i,
    plain: "A small rounded spot is described in the report.",
    doctorQuestion:
      "Does this nodule need comparison with older imaging or follow-up imaging?",
  },
];

const URGENT_TERMS: Array<{ label: string; regex: RegExp }> = [
  {
    label: "cord compression or cord flattening",
    regex: /\b(?:cord compression|cord flattening|flattening .* cord|mass effect .* cord)\b/i,
  },
  { label: "cauda equina", regex: /\bcauda equina\b/i },
  { label: "fracture", regex: /\bfracture\b/i },
  { label: "mass", regex: /\bmass\b(?!\s+effect)/i },
  { label: "aneurysm", regex: /\baneurysm\b/i },
  { label: "bleed", regex: /\b(?:bleed|hemorrhage)\b/i },
  { label: "abscess", regex: /\babscess\b/i },
  { label: "infection", regex: /\binfection\b/i },
];

function inferSeverity(text: string): Severity {
  if (/\bsevere\b/i.test(text)) return "severe";
  if (/\bmoderate\b/i.test(text)) return "moderate";
  if (/\bmild\b/i.test(text)) return "mild";
  return "not specified";
}

function locationFromText(text: string): string {
  const level = text.match(/\b(?:C|T|L|S)\d(?:[-/](?:C|T|L|S)?\d)?\b/i)?.[0];
  if (level) return level.toUpperCase();
  const side = text.match(/\b(left|right|bilateral|central|midline)\b/i)?.[0];
  return side ? side.toLowerCase() : "Location not clearly stated";
}

interface SpineSection {
  level: string;
  text: string;
}

function spineSections(text: string): SpineSection[] {
  const matches = [...text.matchAll(/\b([CTL]\d(?:[-–](?:[CTL])?\d)?)\s*:\s*/gi)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const next = matches[index + 1]?.index ?? text.length;
    const sectionText = text
      .slice(start, next)
      .split(/\n(?:Apart\b|IMPRESSION\b|--)/i)[0];
    return {
      level: match[1]
        .replace("–", "-")
        .replace(/([CTL])(\d)-(?=\d)/i, "$1$2-$1")
        .toUpperCase(),
      text: sectionText,
    };
  });
}

function isNegatedFinding(sectionText: string, term: string): boolean {
  const text = sectionText.replace(/\s+/g, " ").toLowerCase();
  if (
    (term === "herniation" || term === "disc bulge") &&
    /no disc herniation or bulg(?:e|ing)/i.test(text)
  ) {
    return true;
  }
  if (
    term === "stenosis" &&
    /no (?:canal or foraminal|central canal|canal) stenosis/i.test(text)
  ) {
    return true;
  }
  if (
    term === "foraminal narrowing" &&
    /no (?:canal or foraminal|foraminal) stenosis/i.test(text)
  ) {
    return true;
  }
  return false;
}

function entryToFinding(entry: GlossaryEntry, severity: Severity, level: string): Finding {
  return {
    level,
    finding: entry.term,
    plainLanguage: entry.plain,
    severity,
    possibleSymptoms: [
      "This may or may not cause symptoms. Symptoms depend on location and your exam.",
    ],
  };
}

function sectionFindings(reportText: string): {
  findings: Finding[];
  questions: string[];
} {
  const sections = spineSections(reportText);
  if (sections.length < 2) return { findings: [], questions: [] };

  const findings: Finding[] = [];
  const questions: string[] = [];

  for (const section of sections) {
    const matched = GLOSSARY.filter(
      (item) =>
        item.regex.test(section.text) &&
        !isNegatedFinding(section.text, item.term),
    ).slice(0, 4);
    for (const entry of matched) {
      findings.push(entryToFinding(entry, inferSeverity(section.text), section.level));
      questions.push(entry.doctorQuestion);
    }
  }

  return { findings, questions };
}

const STANDARD_QUESTIONS = [
  "What are the main findings in this report?",
  "Do the findings match my symptoms and physical exam?",
  "Do I need follow-up imaging, a referral, or any activity limits?",
  "What symptoms should make me call you or seek urgent care?",
];

const DEFAULT_DISCLAIMER =
  "This explanation is based on the radiology report you provided. It is for educational purposes only. It does not diagnose your condition, recommend treatment, or replace advice from your physician.";

/** Build a structured ExplainResult from raw report text using local
 *  pattern matching only. No network calls. */
export function fallbackExplanation(
  reportText: string,
  examType: string,
  bodyRegion: string,
): ExplainResult {
  const fromSections = sectionFindings(reportText);

  let findings: Finding[] = fromSections.findings;
  let extraQuestions: string[] = fromSections.questions;

  if (findings.length === 0) {
    const matched = GLOSSARY.filter((item) => item.regex.test(reportText)).slice(
      0,
      7,
    );
    findings = matched.map((entry) =>
      entryToFinding(entry, inferSeverity(reportText), locationFromText(reportText)),
    );
    extraQuestions = matched.map((entry) => entry.doctorQuestion);
  }

  const redFlags = URGENT_TERMS.filter((u) => u.regex.test(reportText)).map(
    (u) =>
      `The report mentions "${u.label}". Contact your clinician promptly. Seek urgent care now for severe or worsening symptoms.`,
  );

  const safeFindings: Finding[] =
    findings.length > 0
      ? findings
      : [
          {
            level: null,
            finding: "No specific glossary term detected",
            plainLanguage:
              "The app could not confidently identify a common finding from the report text. Review the exact wording with your clinician.",
            severity: "not specified",
            possibleSymptoms: ["Symptoms cannot be estimated from this text alone."],
          },
        ];

  const allQuestions = [...STANDARD_QUESTIONS, ...extraQuestions];
  const questionsForDoctor = Array.from(new Set(allQuestions)).slice(0, 7);

  return {
    reportType: examType || "Imaging exam",
    bodyRegion: bodyRegion || "Body area not specified",
    summary:
      "Your report describes imaging findings that should be reviewed with the clinician who ordered the test. This explanation summarises the written report in plain language and does not interpret the images.",
    findings: safeFindings,
    questionsForDoctor,
    redFlags,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
