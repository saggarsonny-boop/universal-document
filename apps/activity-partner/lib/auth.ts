// Auth helpers — thin wrappers around Clerk's currentUser() that also
// resolve the matching hap_users row. Routes that touch any HAP data MUST
// call requireHapUser() rather than constructing user state by hand; this
// is the single chokepoint that enforces the Clerk → hap_users mapping.

import { currentUser } from "@clerk/nextjs/server";
import { sql } from "./db";

export type ClerkUserSummary = {
  clerkUserId: string;
  email: string | null;
  emailVerified: boolean;
};

export async function getClerkUser(): Promise<ClerkUserSummary | null> {
  const u = await currentUser();
  if (!u) return null;
  const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId);
  const email = primary?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null;
  const verified = primary?.verification?.status === "verified";
  return { clerkUserId: u.id, email, emailVerified: verified };
}

export type HapUserRow = {
  id: string;
  clerk_user_id: string;
  email: string;
  email_verified: boolean;
  age_band: string;
  age_verified: boolean;
  city: string;
  neighborhood: string | null;
  trust_score: number;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
};

// Returns the hap_users row for the signed-in Clerk user, or null if either
// the user isn't signed in or hasn't completed signup yet (no hap_users row).
// NOTE: exact_location_lat/lng are deliberately omitted from the SELECT.
export async function getHapUser(): Promise<HapUserRow | null> {
  const clerk = await getClerkUser();
  if (!clerk) return null;
  const rows = (await sql`
    SELECT id, clerk_user_id, email, email_verified, age_band, age_verified,
           city, neighborhood, trust_score, is_suspended, created_at, updated_at
    FROM hap_users
    WHERE clerk_user_id = ${clerk.clerkUserId}
    LIMIT 1
  `) as HapUserRow[];
  return rows[0] ?? null;
}

// Throws if the user is not signed in. Use in API routes that require auth.
export async function requireClerkUser(): Promise<ClerkUserSummary> {
  const u = await getClerkUser();
  if (!u) {
    const err = new Error("UNAUTHENTICATED");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return u;
}

// Throws 401 if not signed in, 404 if signed in but hap_users row not yet
// created (user hasn't finished POST /api/users). Suspended users get a 403
// so they see a distinct error from "no profile yet".
export async function requireHapUser(): Promise<HapUserRow> {
  const me = await getHapUser();
  if (!me) {
    const clerk = await getClerkUser();
    if (!clerk) {
      const err = new Error("UNAUTHENTICATED");
      (err as Error & { status?: number }).status = 401;
      throw err;
    }
    const err = new Error("HAP_PROFILE_REQUIRED");
    (err as Error & { status?: number }).status = 404;
    throw err;
  }
  if (me.is_suspended) {
    const err = new Error("HAP_USER_SUSPENDED");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return me;
}
