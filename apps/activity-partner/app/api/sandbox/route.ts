import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let prompt = "";
    if (documentType === "Financial Q3 Report") {
      prompt = "Act as the AAC Enterprise Agent. The user just uploaded a complex Q3 Financial Report. Give a 2-sentence highly analytical response summarizing that you've ingested the data, identified a 15% discrepancy in OpEx, and are ready to execute budget reallocations.";
    } else if (documentType === "HR Payroll Schema") {
      prompt = "Act as the AAC Enterprise Agent. The user just uploaded an HR Payroll Schema. Give a 2-sentence response stating you've ingested the employee data across 14 regions and automatically flagged 3 compliance violations in EU payroll.";
    } else if (documentType === "Lean Six Sigma SOP") {
      prompt = "Act as the AAC Enterprise Agent. The user just uploaded a Lean Six Sigma SOP for a factory floor. Give a 2-sentence response stating you've mapped the logic to the robotic routing system and instantly eliminated 40 hours of manual QA time per week.";
    } else if (documentType === "Clinical Billing Codes") {
      prompt = "Act as the AAC Enterprise Agent. The user just uploaded Clinical Billing Codes (ICD-10). Give a 2-sentence response stating you've cross-referenced 5,000 patient charts and automatically corrected 12 rejected claims, recovering $45,000 in lost revenue.";
    } else {
      prompt = `Act as the AAC Enterprise Agent. The user uploaded ${documentType}. Give a hyper-competent 2 sentence response confirming ingestion and readiness.`;
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text safely depending on the SDK version
    const textBlock = msg.content[0];
    const text = 'text' in textBlock ? textBlock.text : "Processed successfully.";

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Sandbox API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
