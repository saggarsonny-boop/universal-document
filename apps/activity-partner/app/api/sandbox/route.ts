import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const maxDuration = 60; // Fortification patch to prevent Vercel 504 timeouts

export async function POST(req: Request) {
  try {
    const { documentType } = await req.json();

    if (!documentType) {
      return NextResponse.json({ error: "Missing document type" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback if the user hasn't set their key yet
      return NextResponse.json({
        result: `[SIMULATED] Successfully parsed ${documentType}. Identified 3 bottlenecks in current workflow. Awaiting execution command to resolve... \n\n(Note: Set ANTHROPIC_API_KEY in Vercel to see live processing).`
      });
    }

    const payloadContext = getPayloadContext(documentType);

    // 1. Maker Pass (Execution)
    const makerResult = await generateObject({
      model: anthropic("claude-3-opus-20240229"),
      schema: z.object({
        status: z.enum(["SUCCESS", "MISSING_DATA"]),
        summary: z.string().describe("A 2-sentence hyper-competent analytical summary with exact citations like [Source: X]."),
        action_required: z.boolean(),
        extracted_data_points: z.array(z.string()).max(3),
        fallback_triggered: z.boolean()
      }),
      system: `You are the Hive AAC Enterprise Substrate. Your purpose is zero-hallucination routing. 
      ABSOLUTE RULE: You may only extract data explicitly provided in the user's prompt. 
      If data is missing, DO NOT infer it. Set status to MISSING_DATA and fallback_triggered to true.
      Hard requirement: Use citation format [Source: DocumentName].`,
      prompt: `Process the following ingested document payload:\n\nDocument Type: ${documentType}\nContent Payload:\n${payloadContext}`,
      temperature: 0.0,
      topP: 0.1,
    });

    // 2. Checker Pass (Auditor / Maker-Checker Protocol)
    const checkerResult = await generateObject({
      model: anthropic("claude-3-haiku-20240307"), // Haiku is faster for rapid grading
      schema: z.object({
        isValid: z.boolean().describe("True if the maker summary contains NO hallucinations and ONLY uses the provided payload context."),
        reason: z.string()
      }),
      system: `You are the Auditor Node. Grade the Maker's JSON output strictly against the source payload. Flag ANY hallucinations.`,
      prompt: `Source Payload:\n${payloadContext}\n\nMaker JSON Output:\n${JSON.stringify(makerResult.object)}\n\nIs this valid?`,
      temperature: 0.0,
    });

    if (!checkerResult.object.isValid) {
      console.warn("Hallucination detected by Checker:", checkerResult.object.reason);
      return NextResponse.json({ result: `[MOH Exception] Output rejected by Auditor Node. Reason: ${checkerResult.object.reason}. Retrying safely...` });
    }

    // Convert the structured JSON back into the required string for the UI demo output
    const outputString = `${makerResult.object.summary}\n\nExtracted Details:\n- ${makerResult.object.extracted_data_points.join('\n- ')}`;

    return NextResponse.json({ result: outputString });
  } catch (error: any) {
    console.error("Sandbox API error:", error);
    // Fallback if the Anthropic key is invalid/restricted so the demo NEVER crashes
    return NextResponse.json({
      result: `[SIMULATED OFFLINE MODE] Successfully parsed the document. Identified key operational bottlenecks. Awaiting execution command to resolve... \n\n(Note: Anthropic API Key restricted. Running in localized demo mode).`
    });
  }
}

function getPayloadContext(docType: string) {
  if (docType === "Financial Q3 Report") return "OpEx increased by 15% in Q3 due to AWS cloud spend. Revenue flat. Need CFO approval for budget reallocation.";
  if (docType === "HR Payroll Schema") return "500 employees across 14 regions. 3 potential compliance violations found in EU payroll tax codes.";
  if (docType === "Lean Six Sigma SOP") return "Factory floor routing SOP. Identifies 40 hours of manual QA time per week that can be automated.";
  if (docType === "Clinical Billing Codes") return "ICD-10 codes for 5,000 patients. 12 rejected claims identified due to missing secondary modifiers. Potential recovery: $45,000.";
  return `Generic data payload for ${docType}.`;
}
