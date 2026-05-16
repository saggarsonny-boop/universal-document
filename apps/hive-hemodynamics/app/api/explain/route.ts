// /api/explain — main pipeline.
//
//   1. PHI scrub the report text server-side (defence in depth alongside
//      client-side detectPhi preview).
//   2. Cost-cap check — if today's per-process spend is over the cap, skip
//      the Anthropic call and serve the rule-based fallback instead.
//   3. Anthropic Sonnet 4 call → parse JSON.
//   4. On Anthropic success: try Replicate FLUX for the medical illustration.
//      On any FLUX failure (missing token, HTTP, malformed): fall back to
//      the local SVG diagram. Both produce data the client can render
//      directly.
//   5. On Anthropic failure: rule-based fallback explanation + SVG diagram.
//
// Returns ExplainResult with `illustrationUrl`, `illustrationSource`, and
// `source` set in addition to the canonical explanation fields.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  USER_TEXT_INSTRUCTION,
  USER_IMAGE_INSTRUCTION,
} from "@/lib/promptTemplate";
import { ParseError, parseModelResponse } from "@/lib/parseReport";
import { removePhi } from "@/lib/privacy";
import { fallbackExplanation } from "@/lib/fallback";
import { buildDiagramSvg } from "@/lib/diagram";
import { generateIllustration } from "@/lib/illustration";
import {
  estimateAnthropicCents,
  isOverCap,
  recordSpend,
} from "@/lib/cost-cap";
import type { ExplainRequestBody, ExplainResult } from "@/types/plainscan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2048;
const MAX_REPORT_CHARS = 15000;

function isTextBody(
  body: ExplainRequestBody,
): body is { reportText: string; examType?: string; bodyRegion?: string } {
  return typeof (body as { reportText?: unknown }).reportText === "string";
}

function isImageBody(
  body: ExplainRequestBody,
): body is {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png";
  examType?: string;
  bodyRegion?: string;
} {
  const b = body as { imageBase64?: unknown; mediaType?: unknown };
  return (
    typeof b.imageBase64 === "string" &&
    (b.mediaType === "image/jpeg" || b.mediaType === "image/png")
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function attachIllustration(result: ExplainResult): Promise<ExplainResult> {
  const ai = await generateIllustration(result);
  if (ai) {
    return { ...result, illustrationUrl: ai, illustrationSource: "ai" };
  }
  return {
    ...result,
    illustrationUrl: buildDiagramSvg(result),
    illustrationSource: "svg",
  };
}

export async function POST(req: NextRequest) {
  let body: ExplainRequestBody;
  try {
    body = (await req.json()) as ExplainRequestBody;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const examType = (body as { examType?: string }).examType ?? "";
  const bodyRegion = (body as { bodyRegion?: string }).bodyRegion ?? "";

  // ─── Text-input branch ──────────────────────────────────────────────
  if (isTextBody(body)) {
    const cleaned = removePhi(body.reportText.trim()).slice(0, MAX_REPORT_CHARS);
    if (!cleaned) return jsonError("Report text is empty.", 400);

    // Cost-cap or no key → rule-based fallback path.
    if (!apiKey || isOverCap()) {
      const fb = fallbackExplanation(cleaned, examType, bodyRegion);
      const withDiagram = await attachIllustration({ ...fb, source: "fallback" });
      return NextResponse.json(withDiagram);
    }

    let response: Anthropic.Message;
    try {
      const client = new Anthropic({ apiKey });
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: USER_TEXT_INSTRUCTION },
              { type: "text", text: cleaned },
            ],
          },
        ],
      });
    } catch {
      const fb = fallbackExplanation(cleaned, examType, bodyRegion);
      const withDiagram = await attachIllustration({ ...fb, source: "fallback" });
      return NextResponse.json(withDiagram);
    }

    if (response.usage) {
      recordSpend(
        estimateAnthropicCents(
          response.usage.input_tokens,
          response.usage.output_tokens,
        ),
      );
    }

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      const fb = fallbackExplanation(cleaned, examType, bodyRegion);
      const withDiagram = await attachIllustration({ ...fb, source: "fallback" });
      return NextResponse.json(withDiagram);
    }

    try {
      const parsed = parseModelResponse(textBlock.text);
      if ("error" in parsed) return NextResponse.json(parsed, { status: 422 });
      const withDiagram = await attachIllustration({ ...parsed, source: "ai" });
      return NextResponse.json(withDiagram);
    } catch (err) {
      if (err instanceof ParseError) {
        const fb = fallbackExplanation(cleaned, examType, bodyRegion);
        const withDiagram = await attachIllustration({ ...fb, source: "fallback" });
        return NextResponse.json(withDiagram);
      }
      return jsonError("Something went wrong. Please check your report and try again.", 500);
    }
  }

  // ─── Image-input branch ─────────────────────────────────────────────
  if (isImageBody(body)) {
    if (!body.imageBase64.trim()) return jsonError("Image is empty.", 400);
    if (!apiKey) {
      return jsonError(
        "Image-based explanations require the AI service. Please paste the report text instead.",
        503,
      );
    }
    if (isOverCap()) {
      return jsonError(
        "Image-based explanations are temporarily over today's cost cap. Please paste the report text instead.",
        503,
      );
    }

    let response: Anthropic.Message;
    try {
      const client = new Anthropic({ apiKey });
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: USER_IMAGE_INSTRUCTION },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: body.mediaType,
                  data: body.imageBase64,
                },
              },
            ],
          },
        ],
      });
    } catch {
      return jsonError(
        "Something went wrong. Please check your image and try again.",
        502,
      );
    }

    if (response.usage) {
      recordSpend(
        estimateAnthropicCents(
          response.usage.input_tokens,
          response.usage.output_tokens,
        ),
      );
    }

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      return jsonError(
        "Could not read the report from this image. Try pasting the text instead.",
        422,
      );
    }
    try {
      const parsed = parseModelResponse(textBlock.text);
      if ("error" in parsed) return NextResponse.json(parsed, { status: 422 });
      const withDiagram = await attachIllustration({ ...parsed, source: "ai" });
      return NextResponse.json(withDiagram);
    } catch (err) {
      if (err instanceof ParseError) {
        return jsonError(
          "Could not read the report from this image. Try pasting the text instead.",
          422,
        );
      }
      return jsonError("Something went wrong. Please try again.", 500);
    }
  }

  return jsonError("Provide either reportText or imageBase64 with mediaType.", 400);
}
