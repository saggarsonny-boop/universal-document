// Pure-function tests for lib/operator-auth.ts. The Clerk + cookies()
// integration is exercised at the route level; here we verify the HMAC
// signing, cookie verification, hash function, and constant-time setup
// code compare behave as expected without hitting Next.js runtime.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hashSetupCode,
  setupCodeMatches,
  issueOperatorCookieValue,
  verifyOperatorCookieValue,
  OPERATOR_COOKIE_TTL_SECONDS,
} from "../lib/operator-auth";

test("hashSetupCode is stable + length 64 hex", () => {
  const a = hashSetupCode("123456");
  const b = hashSetupCode("123456");
  assert.equal(a, b);
  assert.equal(a.length, 64);
  assert.match(a, /^[0-9a-f]{64}$/);

  const c = hashSetupCode("123457");
  assert.notEqual(a, c);
});

test("setupCodeMatches — equal and unequal both run constant-time", () => {
  assert.equal(setupCodeMatches("123456", "123456"), true);
  assert.equal(setupCodeMatches("123456", "654321"), false);
  // Different lengths must short-circuit to false safely (not throw).
  assert.equal(setupCodeMatches("12345", "123456"), false);
});

test("issueOperatorCookieValue + verifyOperatorCookieValue round-trip", () => {
  process.env.OPERATOR_AUTH_SECRET = "test-secret-not-real";
  const value = issueOperatorCookieValue("u_123");
  assert.ok(value, "cookie value should be issued when OPERATOR_AUTH_SECRET is set");
  const verified = verifyOperatorCookieValue(value!);
  assert.ok(verified);
  assert.equal(verified!.identity, "u_123");
});

test("verifyOperatorCookieValue rejects tampered cookies", () => {
  process.env.OPERATOR_AUTH_SECRET = "test-secret-not-real";
  const value = issueOperatorCookieValue("u_123");
  assert.ok(value);
  const tampered = value!.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
  assert.equal(verifyOperatorCookieValue(tampered), null);
});

test("verifyOperatorCookieValue rejects expired cookies", async () => {
  process.env.OPERATOR_AUTH_SECRET = "test-secret-not-real";
  // Manually craft a cookie issued > TTL ago.
  const issuedAt = Date.now() - (OPERATOR_COOKIE_TTL_SECONDS + 60) * 1000;
  const idEncoded = Buffer.from("u_123", "utf8").toString("base64url");
  const { createHmac } = await import("node:crypto");
  const sig = createHmac("sha256", "test-secret-not-real")
    .update(`${issuedAt}.${idEncoded}`)
    .digest("base64url");
  const expired = `${issuedAt}.${idEncoded}.${sig}`;
  assert.equal(verifyOperatorCookieValue(expired), null);
});

test("issueOperatorCookieValue returns null when secret is missing", () => {
  delete process.env.OPERATOR_AUTH_SECRET;
  assert.equal(issueOperatorCookieValue("u_123"), null);
});
