// POST /api/users — idempotent profile creation/update.
// First call upserts the hap_users row with the Clerk identity + age band +
// city, then upserts the hap_profiles row. Returns the hap_users.id for
// redirect to /profile/[userId].

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getClerkUser } from "@/lib/auth";
import { isAgeBand, AGE_BANDS } from "@/lib/profile";
import { isValidLanguageCode } from "@/lib/languages";
import { encryptEmergencyContact } from "@/lib/encryption";

export const dynamic = "force-dynamic";

type Body = {
  ageBand: string;
  city: string;
  neighborhood: string | null;
  displayName: string;
  bio: string | null;
  languagesSpoken: string[];
  emergencyContact: string | null;
  isOpenToRomanticInterest: boolean;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const clerk = await getClerkUser();
  if (!clerk) return bad("Not signed in", 401);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Invalid JSON");
  }

  // Validation — match the DB CHECK constraints so we surface friendly
  // errors instead of letting Postgres reject.
  if (!isAgeBand(body.ageBand)) {
    return bad(`ageBand must be one of: ${AGE_BANDS.join(", ")}`);
  }
  const city = (body.city ?? "").trim();
  if (!city) return bad("city is required");
  const neighborhood = (body.neighborhood ?? "")?.trim() || null;

  const displayName = (body.displayName ?? "").trim();
  if (displayName.length < 2 || displayName.length > 30) {
    return bad("displayName must be 2–30 characters");
  }
  const bio = (body.bio ?? "")?.trim() || null;
  if (bio && bio.length > 200) return bad("bio must be 200 characters or fewer");

  const languages = Array.isArray(body.languagesSpoken)
    ? body.languagesSpoken.filter((c) => typeof c === "string" && isValidLanguageCode(c))
    : [];
  if (languages.length === 0) return bad("at least one valid language is required");

  const isOpenToRomance = Boolean(body.isOpenToRomanticInterest);

  // Under-25 users (18-24 band) must complete Stripe Identity verification
  // before age_verified flips. We mark them needing verification here and
  // queue a hap_verifications row so the async flow can pick it up.
  const needsAgeVerification = body.ageBand === "18-24";

  // 1) Upsert hap_users by Clerk ID. Email + email_verified come from the
  //    Clerk session; the DB insert sets neighborhood + age band + city.
  const userRows = (await sql`
    INSERT INTO hap_users (clerk_user_id, email, email_verified, age_band, age_verified, city, neighborhood)
    VALUES (
      ${clerk.clerkUserId},
      ${clerk.email ?? ""},
      ${clerk.emailVerified},
      ${body.ageBand},
      ${needsAgeVerification ? false : true},
      ${city},
      ${neighborhood}
    )
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      age_band = EXCLUDED.age_band,
      city = EXCLUDED.city,
      neighborhood = EXCLUDED.neighborhood,
      updated_at = NOW()
    RETURNING id
  `) as Array<{ id: string }>;

  const userId = userRows[0]?.id;
  if (!userId) return bad("failed to create user", 500);

  // 2) Encrypt emergency contact if provided. We never store plaintext;
  //    decryption is only on the moderator review path.
  let encryptedContact: string | null = null;
  if (body.emergencyContact && body.emergencyContact.trim().length > 0) {
    try {
      encryptedContact = encryptEmergencyContact(body.emergencyContact.trim());
    } catch {
      return bad(
        "Emergency contact encryption is not configured. Contact field can be filled in later.",
        503,
      );
    }
  }

  // 3) Upsert hap_profiles.
  await sql`
    INSERT INTO hap_profiles (
      user_id, display_name, bio, languages_spoken,
      emergency_contact_encrypted, is_open_to_romantic_interest
    ) VALUES (
      ${userId},
      ${displayName},
      ${bio},
      ${languages},
      ${encryptedContact},
      ${isOpenToRomance}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      bio = EXCLUDED.bio,
      languages_spoken = EXCLUDED.languages_spoken,
      emergency_contact_encrypted = COALESCE(EXCLUDED.emergency_contact_encrypted, hap_profiles.emergency_contact_encrypted),
      is_open_to_romantic_interest = EXCLUDED.is_open_to_romantic_interest,
      updated_at = NOW()
  `;

  // 4) For 18-24, queue the Stripe Identity verification record so the
  //    async pipeline can pick it up. Idempotent via the unique index.
  if (needsAgeVerification) {
    await sql`
      INSERT INTO hap_verifications (user_id, method, status)
      VALUES (${userId}, 'stripe_identity', 'pending')
      ON CONFLICT (user_id, method) DO NOTHING
    `;
  }

  return NextResponse.json({ userId });
}
