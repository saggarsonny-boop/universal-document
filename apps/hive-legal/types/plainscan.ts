export type Severity = "mild" | "moderate" | "severe" | "not specified";

export interface Finding {
  level: string | null;
  finding: string;
  plainLanguage: string;
  severity: Severity;
  possibleSymptoms: string[];
}

export interface ExplainResult {
  bodyRegion: string;
  reportType: string;
  summary: string;
  findings: Finding[];
  questionsForDoctor: string[];
  redFlags: string[];
  disclaimer: string;
  /** AI-generated illustration URL (Replicate FLUX) when available; otherwise
   *  a data: URL containing the SVG fallback diagram. Always set. */
  illustrationUrl?: string;
  /** Where the illustration came from. "ai" = Replicate FLUX,
   *  "svg" = local SVG fallback. */
  illustrationSource?: "ai" | "svg";
  /** Where the explanation came from. "ai" = Anthropic, "fallback" = local
   *  rule-based glossary. */
  source?: "ai" | "fallback";
}

export interface ExplainError {
  error: string;
}

export type ExplainPayload = ExplainResult | ExplainError;

export type ExplainRequestBody =
  | { reportText: string; examType?: string; bodyRegion?: string }
  | {
      imageBase64: string;
      mediaType: "image/jpeg" | "image/png";
      examType?: string;
      bodyRegion?: string;
    };
