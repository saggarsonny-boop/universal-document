export type Severity = "mild" | "moderate" | "severe" | "not specified";

export interface Finding {
  level: string | null;
  finding: string;
  plainLanguage: string;
  severity: Severity;
  possibleSymptoms: string[];
}

export interface ExplainResult {
  questions?: string[];
  bodyRegion: string;
  reportType: string;
  summary: string;
  findings: Finding[];
  questionsForDoctor: string[];
  redFlags: string[];
  disclaimer: string;
  /** AI-generated illustration when available, otherwise a data: URL
   *  containing the SVG fallback diagram. Always set when illustration
   *  step ran. OpenAI returns `data:image/png;base64,â€¦`; Replicate
   *  returns the Replicate-hosted HTTPS URL; SVG returns
   *  `data:image/svg+xml,â€¦`. */
  illustrationUrl?: string;
  /** Where the illustration came from.
   *    "openai"    = OpenAI gpt-image-1 (primary, per [AI_PROVIDER_ROUTING])
   *    "replicate" = Replicate FLUX schnell (graceful fallback)
   *    "svg"       = local SVG diagram (final fallback before text-only)
   *    "ai"        = retained for backwards-compat with already-deployed
   *                  clients that branch on this field; treated as
   *                  "image came from a model". */
  illustrationSource?: "openai" | "replicate" | "svg" | "ai";
  /** Where the explanation came from. "ai" = Anthropic, "fallback" = local
   *  rule-based glossary. */
  source?: "ai" | "fallback";
}

export interface ExplainError {
  error: string;
}

export type ExplainPayload = ExplainResult | ExplainError;

export type ExplainRequestBody =
  | {
      reportText: string;
      examType?: string;
      bodyRegion?: string;
      /** Opaque per-session id for the per-session image-generation cap
       *  in `lib/cost-cap.ts`. Optional â€” missing ids count against a
       *  shared anonymous bucket (also capped). */
      sessionId?: string;
    }
  | {
      imageBase64: string;
      mediaType: "image/jpeg" | "image/png";
      examType?: string;
      bodyRegion?: string;
      sessionId?: string;
    };
