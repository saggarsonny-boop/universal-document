// Operator role per Constitution §V. Three valid markers, in priority order:
//
//   1. Clerk publicMetadata.role === 'operator' on the signed-in user.
//   2. Signed cookie hap_operator (HMAC-SHA256 with OPERATOR_AUTH_SECRET, 30-day TTL).
//   3. Header x-hap-operator-key matching OPERATOR_KEY (constant-time compared).
//
// Any operator-flagged action MUST log to hap_operator_audit via lib/db-operator.ts.
// The operator role is for testing, debugging, and emergency access. Never expose
// it in UI, pricing, or marketing copy.

import { createHmac, timingSafeEqual, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

export const OPERATOR_COOKIE_NAME = "hap_operator";
export const OPERATOR_HEADER_NAME = "x-hap-operator-key";
export const OPERATOR_COOKIE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type OperatorIdentity = {
  marker: "clerk" | "cookie" | "header";
  identity: string;
};

function getSecret(name: "OPERATOR_AUTH_SECRET" | "OPERATOR_KEY"): string | null {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function constantTimeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

// Cookie value: <issuedAtMs>.<identity-base64url>.<sig-base64url>
// sig = HMAC-SHA256(OPERATOR_AUTH_SECRET, "<issuedAtMs>.<identity-base64url>")
function signCookieValue(identity: string, issuedAtMs: number, secret: string): string {
  const idEncoded = Buffer.from(identity, "utf8").toString("base64url");
  const payload = `${issuedAtMs}.${idEncoded}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function issueOperatorCookieValue(identity: string): string | null {
  const secret = getSecret("OPERATOR_AUTH_SECRET");
  if (!secret) return null;
  return signCookieValue(identity, Date.now(), secret);
}

export function verifyOperatorCookieValue(
  raw: string,
): { identity: string } | null {
  const secret = getSecret("OPERATOR_AUTH_SECRET");
  if (!secret) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [issuedAtStr, idEncoded, providedSig] = parts;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > OPERATOR_COOKIE_TTL_SECONDS * 1000) return null;
  const expectedSig = createHmac("sha256", secret)
    .update(`${issuedAtStr}.${idEncoded}`)
    .digest("base64url");
  if (!constantTimeStringEqual(providedSig, expectedSig)) return null;
  let identity: string;
  try {
    identity = Buffer.from(idEncoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!identity) return null;
  return { identity };
}

// Returns the operator identity (and which marker matched) or null. The header
// path takes precedence for CLI use; Clerk overrides cookie when present so a
// signed-in operator's identity is the canonical Clerk user id.
export async function detectOperator(req: Request): Promise<OperatorIdentity | null> {
  // 1) Clerk metadata
  try {
    const u = await currentUser();
    const role = (u?.publicMetadata as { role?: unknown } | undefined)?.role;
    if (u && role === "operator") {
      return { marker: "clerk", identity: `clerk:${u.id}` };
    }
  } catch {
    // currentUser() can throw outside an authenticated request; fall through.
  }

  // 2) Header (CLI / automation)
  const headerKey = req.headers.get(OPERATOR_HEADER_NAME);
  const expectedHeader = getSecret("OPERATOR_KEY");
  if (headerKey && expectedHeader && constantTimeStringEqual(headerKey, expectedHeader)) {
    return { marker: "header", identity: "header:cli" };
  }

  // 3) Signed cookie
  const cookieJar = await cookies();
  const cookieRaw = cookieJar.get(OPERATOR_COOKIE_NAME)?.value;
  if (cookieRaw) {
    const verified = verifyOperatorCookieValue(cookieRaw);
    if (verified) {
      return { marker: "cookie", identity: `cookie:${verified.identity}` };
    }
  }

  return null;
}

// Throws a 401-flavoured Error if the request is not from an operator.
export async function requireOperator(req: Request): Promise<OperatorIdentity> {
  const op = await detectOperator(req);
  if (!op) {
    const err = new Error("OPERATOR_REQUIRED");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return op;
}

// Hash the OPERATOR_SETUP_CODE for consumed-codes lookup. Storing the hash
// (not the code) means even DB read access can't replay the bootstrap.
export function hashSetupCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

export function getConfiguredSetupCode(): string | null {
  return getSecret("OPERATOR_AUTH_SECRET") ? process.env.OPERATOR_SETUP_CODE ?? null : null;
}

// Constant-time setup-code compare; both args are user input.
export function setupCodeMatches(provided: string, configured: string): boolean {
  return constantTimeStringEqual(provided, configured);
}

export function newRequestId(): string {
  return randomBytes(8).toString("hex");
}
