// /api/waitlist — capture B2B-tier waitlist signups.
//
// POST body: { email, company, role, expectedVolume, requestedTier }.
//   - requestedTier ∈ {"clinic","practice","enterprise"}.
//   - email: required, basic regex validation.
//   - company: required.
//   - role + expectedVolume: free-form strings (the form constrains them
//     to enums but we accept any string here).
//
// Storage: inserts into `hps_waitlist` (created in migrations/002_paywall.sql).
// When DATABASE_URL is unset (preview / local dev without DB) the route
// returns 503 with a clear message rather than crashing — the form
// surfaces the message inline. This means a fresh deploy without DB
// provisioning gives operators a visible signal instead of silent
// failure.
//
// GET (operator only): lists all waitlist entries. Operator gate is
// the existing `x-operator-key` HMAC header pattern from CLAUDE.md §V
// `[OPERATOR_ROLE]`. When `OPERATOR_KEY` is unset the GET returns 404
// to keep the route surface invisible.

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TIERS = new Set(["clinic", "practice", "enterprise"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WaitlistBody {
  email: string;
  company: string;
  role: string;
  expectedVolume: string;
  requestedTier: string;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return new Pool({ connectionString: url });
}

export async function POST(req: NextRequest) {
  let body: Partial<WaitlistBody>;
  try {
    body = (await req.json()) as Partial<WaitlistBody>;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const role = String(body.role ?? "").trim().slice(0, 200);
  const volume = String(body.expectedVolume ?? "").trim().slice(0, 200);
  const tier = String(body.requestedTier ?? "").trim();

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return jsonError("Please enter a valid work email.", 400);
  }
  if (!company || company.length > 200) {
    return jsonError("Please enter your organization name.", 400);
  }
  if (!ALLOWED_TIERS.has(tier)) {
    return jsonError("Unknown tier.", 400);
  }

  const pool = getPool();
  if (!pool) {
    return jsonError(
      "The waitlist database is being provisioned. Please try again in a few minutes.",
      503,
    );
  }

  try {
    await pool.query(
      `INSERT INTO hps_waitlist (email, requested_tier, company, role, expected_volume)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email, requested_tier) DO UPDATE SET
         company = EXCLUDED.company,
         role = EXCLUDED.role,
         expected_volume = EXCLUDED.expected_volume,
         updated_at = now()`,
      [email, tier, company, role, volume],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(
      e instanceof Error ? `Database error: ${e.message}` : "Database error.",
      500,
    );
  } finally {
    await pool.end().catch(() => null);
  }
}

export async function GET(req: NextRequest) {
  const operatorKey = process.env.OPERATOR_KEY;
  if (!operatorKey) {
    // Hide the surface entirely when the operator gate isn't wired —
    // we do NOT want anonymous read access to waitlist contacts.
    return new NextResponse("Not Found", { status: 404 });
  }
  const presented = req.headers.get("x-operator-key");
  if (presented !== operatorKey) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const pool = getPool();
  if (!pool) {
    return jsonError("Database not configured.", 503);
  }

  try {
    const res = await pool.query(
      `SELECT email, requested_tier, company, role, expected_volume, created_at
         FROM hps_waitlist
         ORDER BY created_at DESC
         LIMIT 500`,
    );
    return NextResponse.json({ count: res.rows.length, entries: res.rows });
  } catch (e) {
    return jsonError(
      e instanceof Error ? `Database error: ${e.message}` : "Database error.",
      500,
    );
  } finally {
    await pool.end().catch(() => null);
  }
}
