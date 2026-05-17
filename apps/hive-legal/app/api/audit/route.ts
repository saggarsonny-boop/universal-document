import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60; // Allow longer processing time for contracts

const AuditSchema = z.object({
  risk_score: z.number().min(0).max(100).describe("0 is perfectly safe, 100 is extremely dangerous and predatory."),
  executive_summary: z.string().describe("A 2-3 sentence summary of the contract's overall risk profile."),
  redlines: z.array(z.object({
    severity: z.enum(["critical", "warning", "info"]),
    clause_excerpt: z.string().describe("The exact text snippet from the contract that is being flagged."),
    issue_description: z.string().describe("Why this clause is dangerous (e.g., unlimited liability, hidden auto-renewal)."),
    recommended_revision: z.string().describe("The exact recommended replacement text for this clause.")
  }))
});

export async function POST(req: Request) {
  try {
    const { contractText } = await req.json();

    if (!contractText || typeof contractText !== 'string') {
      return Response.json({ error: "Invalid contract text provided." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
       return Response.json({ error: "API Key missing." }, { status: 500 });
    }

    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: AuditSchema,
      temperature: 0.0, // Strict deterministic output
      system: `You are the HiveLegal Autonomous Redline Engine. Your job is to audit corporate contracts and legal documents.
You operate on a strict "Maker-Checker" protocol. You must scan the provided contract text against the following Dealbreaker Matrix:

DEALBREAKER MATRIX:
1. Unlimited Liability: Flag any clause where the vendor's liability is uncapped or loosely defined.
2. Auto-Renewals: Flag any clause that auto-renews for a period longer than 1 year without explicit 30-day notice.
3. Non-Competes: Flag any restrictive covenants or non-competes extending beyond 12 months post-termination.
4. Jurisdiction: Flag any governing law clause outside of Delaware, New York, or California.
5. IP Ownership: Flag any clause where the vendor attempts to claim ownership of customer data or derivative works.

Extract the exact problematic clauses, explain why they violate the matrix, and provide a legally sound, standard revision.
DO NOT hallucinate clauses that do not exist in the text. If the contract is clean, return an empty redlines array and a low risk score.`,
      prompt: `Audit the following contract:\n\n${contractText}`
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("Audit Error:", error);
    return Response.json({ error: "Failed to process the contract audit." }, { status: 500 });
  }
}
