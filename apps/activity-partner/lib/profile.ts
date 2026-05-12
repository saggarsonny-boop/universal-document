// Profile shape + the canonical sanitizer applied to every API response.
// The sanitizer is the second-line defense; the SQL SELECTs in lib/auth.ts
// already omit exact_location_*. Both layers exist on purpose.

export const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const VERIFICATION_METHODS = [
  "stripe_identity",
  "linkedin",
  "twitter",
  "referral",
] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export type SelfProfile = {
  userId: string;
  displayName: string;
  bio: string | null;
  ageBand: AgeBand;
  ageVerified: boolean;
  city: string;
  neighborhood: string | null;
  languagesSpoken: string[];
  photoUrl: string | null;
  hasEmergencyContact: boolean;
  isOpenToRomanticInterest: boolean;
  isVerified: boolean;
  verificationMethod: VerificationMethod | null;
  trustScore: number;
  createdAt: string;
};

// Fields that MUST NEVER reach the client. Listed explicitly so a code review
// or grep will flag any future SELECT * that bypasses sanitizeProfile.
export const FORBIDDEN_RESPONSE_FIELDS = [
  "exact_location_lat",
  "exact_location_lng",
  "emergency_contact_encrypted",
] as const;

export function stripForbidden<T extends Record<string, unknown>>(row: T): Omit<T, (typeof FORBIDDEN_RESPONSE_FIELDS)[number]> {
  const out: Record<string, unknown> = { ...row };
  for (const key of FORBIDDEN_RESPONSE_FIELDS) {
    delete out[key];
  }
  return out as Omit<T, (typeof FORBIDDEN_RESPONSE_FIELDS)[number]>;
}

export function isAgeBand(value: unknown): value is AgeBand {
  return typeof value === "string" && (AGE_BANDS as readonly string[]).includes(value);
}
