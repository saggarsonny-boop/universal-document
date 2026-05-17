import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export const maxDuration = 60; // Fortification patch

export async function POST(req: Request) {
  let input = "";
  try {
    const body = await req.json();
    input = body.input;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback
      return NextResponse.json({
        executive_summary: `[SIMULATED OFFLINE MODE] Data ingested: "${input.substring(0, 30)}...". Identified critical context mismatch. Routing to operations for immediate review.`,
        engineering_json: { ticket: "SYS-MOH-ROUTING", priority: "P1", blocker: "Context Validation" },
        french_translation: `[SIMULATED OFFLINE MODE] Entrée reçue: "${input.substring(0, 30)}...". Traitement en cours.`
      });
    }

    const { object } = await generateObject({
      model: anthropic("claude-3-haiku-20240307"),
      schema: z.object({
        executive_summary: z.string().describe("A 1-2 sentence executive summary highlighting risk/ROI."),
        engineering_json: z.object({
          ticket: z.string(),
          priority: z.enum(["P0", "P1", "P2", "P3"]),
          blocker: z.string()
        }),
        french_translation: z.string().describe("A professional translation of the core problem into French to send to the client.")
      }),
      system: `You are the Adaptive AI Activity Companion substrate. Your job is to take raw, messy input and instantly route it into three streams with zero hallucinations.`,
      prompt: `Process the following raw input:\n\n${input}`,
      temperature: 0.0,
      topP: 0.1,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Epiphany Error:", error);
    return NextResponse.json({
      executive_summary: `[SIMULATED OFFLINE MODE] Data ingested: "${input ? input.substring(0, 30) : ''}...". Identified critical context mismatch. Routing to operations for immediate review.`,
      engineering_json: { ticket: "SYS-MOH-ROUTING", priority: "P1", blocker: "Context Validation" },
      french_translation: `[SIMULATED OFFLINE MODE] Entrée reçue: "${input ? input.substring(0, 30) : ''}...". Traitement en cours.`
    });
  }
}
