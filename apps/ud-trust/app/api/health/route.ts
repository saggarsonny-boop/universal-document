// /api/health — canonical Hive health endpoint shape: { engine, version, ok }.
// Used by HiveOps live-health probe (V29) and the Queen Bee /api/audit
// reachability check. Adds a `features` block surfacing which capability
// flags are wired (without exposing key values), plus the image-budget
// snapshot so Vercel logs can monitor cap pressure without DB access.

import { NextResponse } from "next/server";
import { imageBudgetSnapshot } from "@/lib/cost-cap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = "0.3.0";

export async function GET() {
  return NextResponse.json({
    engine: "HivePlainScan",
    version: VERSION,
    ok: true,
    timestamp: new Date().toISOString(),
    features: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      // OpenAI gpt-image-1 — primary image-generation provider per
      // CLAUDE.md §C10 [AI_PROVIDER_ROUTING] (locked 2026-05-09).
      openai: Boolean(process.env.OPENAI_API_KEY),
      // Replicate FLUX — graceful tertiary fallback. Stays available so
      // a missing OPENAI_API_KEY degrades to FLUX before SVG.
      replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    },
    imageBudget: imageBudgetSnapshot(),
  });
}
