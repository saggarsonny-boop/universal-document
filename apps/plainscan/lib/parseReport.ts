import type { ExplainPayload, ExplainResult, Severity } from "@/types/plainscan";

const VALID_SEVERITIES: Severity[] = [
  "mild",
  "moderate",
  "severe",
  "not specified",
];

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }
  return trimmed;
}

function extractJsonObject(raw: string): string {
  const cleaned = stripFences(raw);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ParseError("Model did not return JSON.");
  }
  return cleaned.slice(start, end + 1);
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ParseError(`Field ${field} must be a string.`);
  }
  return value;
}

function ensureStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new ParseError(`Field ${field} must be an array.`);
  }
  return value.map((item, idx) => {
    if (typeof item !== "string") {
      throw new ParseError(`Field ${field}[${idx}] must be a string.`);
    }
    return item;
  });
}

function normalizeSeverity(value: unknown): Severity {
  if (typeof value !== "string") return "not specified";
  const lowered = value.toLowerCase().trim();
  if (VALID_SEVERITIES.includes(lowered as Severity)) {
    return lowered as Severity;
  }
  return "not specified";
}

export function parseModelResponse(raw: string): ExplainPayload {
  const json = extractJsonObject(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ParseError("Model returned invalid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new ParseError("Model response was not a JSON object.");
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.error === "string") {
    return { error: obj.error };
  }

  const findingsRaw = obj.findings;
  if (!Array.isArray(findingsRaw)) {
    throw new ParseError("Field findings must be an array.");
  }

  const findings = findingsRaw.map((item, idx) => {
    if (!item || typeof item !== "object") {
      throw new ParseError(`Field findings[${idx}] must be an object.`);
    }
    const f = item as Record<string, unknown>;
    return {
      level:
        f.level === null || f.level === undefined
          ? null
          : ensureString(f.level, `findings[${idx}].level`),
      finding: ensureString(f.finding, `findings[${idx}].finding`),
      plainLanguage: ensureString(
        f.plainLanguage,
        `findings[${idx}].plainLanguage`,
      ),
      severity: normalizeSeverity(f.severity),
      possibleSymptoms: ensureStringArray(
        f.possibleSymptoms ?? [],
        `findings[${idx}].possibleSymptoms`,
      ),
    };
  });

  const result: ExplainResult = {
    bodyRegion: ensureString(obj.bodyRegion, "bodyRegion"),
    reportType: ensureString(obj.reportType, "reportType"),
    summary: ensureString(obj.summary, "summary"),
    findings,
    questionsForDoctor: ensureStringArray(
      obj.questionsForDoctor ?? [],
      "questionsForDoctor",
    ),
    redFlags: ensureStringArray(obj.redFlags ?? [], "redFlags"),
    disclaimer: ensureString(obj.disclaimer, "disclaimer"),
  };

  return result;
}
