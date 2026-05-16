import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// AAC Enterprise Assistant - Production Route
// Hardcoded demo data from consumer drift has been stripped.
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    // We use Claude 3 Opus for the enterprise assistant role.
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: "You are the Adaptive AI Activity Companion (AAC), an enterprise-grade AI assistant. You provide concise, professional, and highly accurate assistance tailored to the client's specific vertical (clinical, practice, or corporate). Never break character. Prioritize safety, confidentiality, and operational efficiency.",
      messages: messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    });

    return NextResponse.json({ 
      role: "assistant", 
      content: response.content[0].type === 'text' ? response.content[0].text : ''
    });
  } catch (error: any) {
    console.error("AAC Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
