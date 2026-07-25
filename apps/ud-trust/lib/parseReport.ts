import { z } from "zod";

export const explainSchema = z.object({
  summary: z.string().describe("A high-level overview of the Trust document's purpose and key terms."),
  findings: z.array(z.object({
    title: z.string().describe("Clause Name"),
    description: z.string().describe("What the clause actually means"),
    severity: z.enum(["low", "medium", "high"]).describe("Risk level of this clause")
  })).describe("Breakdown of the specific trust provisions, beneficiary arrangements, and distribution terms."),
  questionsForDoctor: z.array(z.string()).describe("Questions or points to negotiate with the trustee or legal counsel."),
  redFlags: z.array(z.string()).describe("High-risk liability traps, indemnification issues, or non-standard fiduciary requirements."),
  disclaimer: z.string().describe("A legal disclaimer stating this is AI analysis and not formal legal advice.")
});
export type ExplainResult = z.infer<typeof explainSchema>;
export type ExplainPayload = ExplainResult | { error: string };
export type ExplainRequestBody = { reportText?: string; images?: string[]; sessionId?: string };

export function parseModelResponse(text: string): ExplainResult {
  const jsonMatch = text.match(/\{.*\}/s);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return explainSchema.parse(JSON.parse(jsonMatch[0]));
}
export class ParseError extends Error {
  constructor(message: string) { super(message); this.name = "ParseError"; }
}