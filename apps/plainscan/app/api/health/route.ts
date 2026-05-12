// /api/health — canonical Hive health endpoint shape: { engine, version, ok }.
// Used by HiveOps live-health probe (V29) and the Queen Bee /api/audit
// reachability check. Adds a `features` block so /api/audit can report
// which capability flags are wired (Anthropic for explanations, Replicate
// for FLUX illustrations) without exposing key values.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = "0.2.0";

export async function GET() {
  return NextResponse.json({
    engine: "HivePlainScan",
    version: VERSION,
    ok: true,
    timestamp: new Date().toISOString(),
    features: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    },
  });
}
