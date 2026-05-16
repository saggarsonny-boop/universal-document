import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Using the secure environment variable to prevent GitHub secret leaks
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "You are the Adaptive AI Activity Companion substrate. Your job is to take raw, messy input and instantly route it into three streams. Stream 1: A 1-2 sentence executive summary highlighting risk/ROI. Stream 2: A strictly formatted JSON payload for Engineering/DevOps containing 'ticket', 'priority' (P0-P3), and 'blocker'. Stream 3: A professional translation of the core problem into French to send to the client. You must respond in ONLY the following JSON format: { \"executive_summary\": \"...\", \"engineering_json\": { \"ticket\": \"...\", \"priority\": \"...\", \"blocker\": \"...\" }, \"french_translation\": \"...\" }",
      messages: [
        { role: "user", content: input }
      ],
    });

    const responseText = msg.content[0].text;
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Epiphany Error:", error);
    return NextResponse.json({ error: "Failed to process the Epiphany" }, { status: 500 });
  }
}
