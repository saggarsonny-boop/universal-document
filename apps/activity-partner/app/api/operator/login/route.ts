// POST /api/operator/login — exchange a single-use OPERATOR_SETUP_CODE for
// the signed hap_operator cookie. The code is hashed (SHA-256) and the hash
// stored in hap_operator_setup_code_state on success, so the same code
// can't be replayed even if leaked. The operator rotates the env var after
// each issuance per Constitution §V.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  OPERATOR_COOKIE_NAME,
  OPERATOR_COOKIE_TTL_SECONDS,
  getConfiguredSetupCode,
  hashSetupCode,
  issueOperatorCookieValue,
  newRequestId,
  setupCodeMatches,
} from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

type Body = { code?: unknown; identity?: unknown };

function bad(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("invalid JSON", 400);
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const identityRaw =
    typeof body.identity === "string" ? body.identity.trim().slice(0, 80) : "";
  const identity = identityRaw || "anon";

  if (!code) return bad("code is required", 400);
  if (!/^[0-9]{6}$/.test(code)) return bad("code must be 6 digits", 400);

  const configured = getConfiguredSetupCode();
  if (!configured) return bad("operator login is not configured", 503);
  if (!setupCodeMatches(code, configured)) {
    return bad("UNAUTHORIZED", 401);
  }

  const requestId = newRequestId();
  const codeHash = hashSetupCode(code);

  // Single-use: try to insert the consumed-code row; if a row already exists
  // for this hash, the code has been used — reject so it can't be replayed.
  const inserted = (await sql`
    INSERT INTO hap_operator_setup_code_state (code_hash, consumed_by_identity, request_id)
    VALUES (${codeHash}, ${identity}, ${requestId})
    ON CONFLICT (code_hash) DO NOTHING
    RETURNING code_hash
  `) as Array<{ code_hash: string }>;
  if (inserted.length === 0) {
    return bad("CODE_ALREADY_USED", 409);
  }

  const cookieValue = issueOperatorCookieValue(`setup:${identity}`);
  if (!cookieValue) {
    return bad("operator cookie signing key not configured", 503);
  }

  const res = NextResponse.json({ ok: true, ttlSeconds: OPERATOR_COOKIE_TTL_SECONDS });
  res.cookies.set(OPERATOR_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: OPERATOR_COOKIE_TTL_SECONDS,
  });
  return res;
}
