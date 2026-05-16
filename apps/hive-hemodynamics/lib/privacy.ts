// PHI scrubbing — two-layer (client preview + server pre-call). Patterns match
// the OCR shapes that show up in finalized radiology reports: MRN, DOB,
// phone, street address, "Patient: <name>" headers. Conservative on names —
// only matches the explicit "Patient:" / "Name:" prefix to avoid stripping
// legitimate clinical eponyms (Achilles, Crohn, etc).

export type PhiKind = "mrn" | "date" | "phone" | "address" | "name";

export interface PhiWarning {
  type: PhiKind;
  label: string;
}

interface Pattern {
  type: PhiKind;
  label: string;
  regex: RegExp;
  replacement: string;
}

const PATTERNS: Pattern[] = [
  {
    type: "mrn",
    label: "Possible medical record number",
    regex: /\b(?:MRN|Medical Record(?: Number)?|Record #)\s*[:#]?\s*[A-Z0-9-]{5,}\b/gi,
    replacement: "[removed medical record number]",
  },
  {
    type: "date",
    label: "Possible date of birth or service date",
    regex: /\b(?:DOB|Date of Birth|Birthdate)\s*[:#]?\s*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Z][a-z]+ \d{1,2},? \d{4})\b/gi,
    replacement: "[removed date]",
  },
  {
    type: "phone",
    label: "Possible phone number",
    regex: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    replacement: "[removed phone number]",
  },
  {
    type: "address",
    label: "Possible street address",
    regex: /\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct)\b/gi,
    replacement: "[removed address]",
  },
  {
    type: "name",
    label: "Possible patient name",
    regex: /\b(?:Patient|Name)\s*[:#]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g,
    replacement: "[removed patient name]",
  },
];

/** Detect — non-mutating; returns one warning per matched pattern type. */
export function detectPhi(text: string): PhiWarning[] {
  return PATTERNS.filter((p) => {
    p.regex.lastIndex = 0;
    return p.regex.test(text);
  }).map(({ type, label }) => ({ type, label }));
}

/** Remove — replaces matches with bracketed placeholders. Idempotent. */
export function removePhi(text: string): string {
  return PATTERNS.reduce((acc, p) => acc.replace(p.regex, p.replacement), text);
}
