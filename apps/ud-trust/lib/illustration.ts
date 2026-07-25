// Medical-illustration provider chain for HiveConfessionEngine.
//
// Three-tier fallback per CLAUDE.md §C10 [AI_PROVIDER_ROUTING]:
//
//   1. OpenAI gpt-image-1 (primary)  — high-quality, anatomically accurate
//      illustrations. Used when OPENAI_API_KEY is set and per-day +
//      per-session image caps haven't been hit. Returns a data URL
//      (`data:image/png;base64,...`) that the client `<img>` and the PDF
//      generator both render unchanged.
//   2. Replicate FLUX (tertiary, kept for graceful degradation) — used
//      when OPENAI_API_KEY is unset or returned an error. Lower quality
//      for medical anatomy per the 2026-05-09 benchmark, but better than
//      a static SVG diagram when both are available. Costs are not
//      recorded against the image cap (FLUX schnell is effectively free
//      on the Replicate hobby tier; the engine fails over here only
//      when OpenAI is unavailable, which is rare).
//   3. SVG diagram + text — handled in `app/api/explain/route.ts` after
//      this module returns null on both paths.
//
// Returns `{ url, source, costCents }` so the explain route can record
// the per-image spend against the cost cap. `costCents = 0` for FLUX
// (counted at Replicate quota level, not in our ledger).

import OpenAI from "openai";
import type { ExplainResult } from "@/types/plainscan";
import {
  buildFluxFallbackPrompt,
  buildIllustrationPrompt,
} from "./image-prompt";

export interface IllustrationResult {
  url: string;
  source: "openai" | "replicate";
  /** Estimated cost in cents for cost-cap accounting. 0 for paths the
   *  cap shouldn't track (Replicate FLUX schnell on hobby tier). */
  costCents: number;
}

// gpt-image-1 high-quality 1024×1024 ≈ $0.25 / image as of 2026-05.
// 1536×1024 (closest landscape to the FLUX 16:9 we used to ship) is
// the same price tier per OpenAI's image-generation pricing page.
const OPENAI_HIGH_CENTS = 25;
const OPENAI_MEDIUM_CENTS = 5;

const REPLICATE_MODEL = "black-forest-labs/flux-schnell";

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

// ─── OpenAI gpt-image-1 ────────────────────────────────────────────────
//
// quality=high produces the textbook-grade anatomical illustration the
// user benchmarked. quality=medium (~$0.05) is documented here as the
// budget option engines can switch to via PLAINSCAN_OPENAI_IMAGE_QUALITY
// when the daily cap is tight.

async function tryOpenAI(
  result: ExplainResult,
): Promise<IllustrationResult | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const quality =
    process.env.PLAINSCAN_OPENAI_IMAGE_QUALITY === "medium" ? "medium" : "high";
  const prompt = buildIllustrationPrompt(result);

  try {
    const res = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      // 1536x1024 — landscape, closest to the FLUX 16:9 we shipped.
      // gpt-image-1 supports 1024x1024 / 1024x1536 / 1536x1024.
      size: "1536x1024",
      quality,
      n: 1,
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) return null;
    return {
      url: `data:image/png;base64,${b64}`,
      source: "openai",
      costCents: quality === "high" ? OPENAI_HIGH_CENTS : OPENAI_MEDIUM_CENTS,
    };
  } catch {
    return null;
  }
}

// ─── Replicate FLUX (graceful-degradation tertiary) ────────────────────

async function tryReplicate(
  result: ExplainResult,
): Promise<IllustrationResult | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const prompt = buildFluxFallbackPrompt(result);

  try {
    const create = await fetch(
      `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 80,
            go_fast: true,
            megapixels: "1",
            disable_safety_checker: false,
          },
        }),
      },
    );
    if (!create.ok) return null;
    const data = (await create.json()) as {
      output?: string | string[];
      status?: string;
      urls?: { get: string };
    };
    const url =
      extractReplicateOutput(data) ??
      (data.urls?.get ? await pollPrediction(data.urls.get, token) : null);
    return url ? { url, source: "replicate", costCents: 0 } : null;
  } catch {
    return null;
  }
}

function extractReplicateOutput(data: {
  output?: string | string[];
}): string | null {
  if (Array.isArray(data.output) && data.output[0]) return data.output[0];
  if (typeof data.output === "string") return data.output;
  return null;
}

async function pollPrediction(url: string, token: string): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as {
        status: string;
        output?: string | string[];
      };
      if (data.status === "succeeded") return extractReplicateOutput(data);
      if (data.status === "failed" || data.status === "canceled") return null;
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Public entry: generate or null ────────────────────────────────────

/**
 * Try OpenAI first, then Replicate FLUX, then return null so the caller
 * falls back to the local SVG diagram. Both provider paths are best-
 * effort — any HTTP error, parse failure, missing key, or timeout
 * yields null so the engine never blocks on the illustration step.
 */
export async function generateIllustration(
  result: ExplainResult,
): Promise<IllustrationResult | null> {
  return (await tryOpenAI(result)) ?? (await tryReplicate(result));
}

/** Re-export for the explain route's debugging / observability. */
export { buildIllustrationPrompt, buildFluxFallbackPrompt };
