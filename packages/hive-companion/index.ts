import { z } from "zod";

// ------------------------------------------------------------------
// AAC (Adaptive AI Activity Companion) GRAMMAR SCHEMA
// ------------------------------------------------------------------

export const AAC_GrammarSchema = z.object({
  ActivityType: z.string().describe("e.g., workout, study, speech, game, cleaning"),
  UserIntent: z.string().describe("e.g., practice, learn, reflect, pace, company"),
  ToneProfile: z.enum(["gentle", "direct", "energetic", "calm", "playful"]),
  Pacing: z.enum(["slow", "medium", "fast"]),
  EmotionalState: z.enum(["neutral", "stressed", "tired", "motivated", "anxious"]),
  PartnerRole: z.enum(["peer", "participant", "companion", "motivator"]),
  GuidanceMode: z.enum(["suggestive", "reflexive", "observational"]),
  Boundaries: z.string().default("no-teaching, no-therapy, no-medical, no-emergency"),
  GrapplerHook: z.string().default("QueenBee.MasterGrappler")
});

export type AAC_Grammar = z.infer<typeof AAC_GrammarSchema>;

// ------------------------------------------------------------------
// ENTERPRISE RBAC (ROLE-BASED ACCESS CONTROL)
// ------------------------------------------------------------------

export type SecurityClearance = "L1_PUBLIC" | "L2_INTERNAL" | "L3_CONFIDENTIAL" | "L4_RESTRICTED" | "L5_EXECUTIVE";

export interface EnterpriseIdentity {
  enterprise_id: string;
  user_id: string;
  role: string;
  clearance: SecurityClearance;
  department: string;
}

/**
 * Validates the security clearance against the required dataset level.
 */
export function validateClearance(identity: EnterpriseIdentity, requiredLevel: SecurityClearance): boolean {
  const levels: SecurityClearance[] = ["L1_PUBLIC", "L2_INTERNAL", "L3_CONFIDENTIAL", "L4_RESTRICTED", "L5_EXECUTIVE"];
  const userIndex = levels.indexOf(identity.clearance);
  const reqIndex = levels.indexOf(requiredLevel);
  return userIndex >= reqIndex;
}

// ------------------------------------------------------------------
// TONE ENGINE V1 (The Emotional Brain of the AAC)
// ------------------------------------------------------------------

export interface ToneEngineParams {
  warmth: number;       // 0 to 10
  directness: number;   // 0 to 10
  humor: number;        // 0 to 10
  pacing: "slow" | "medium" | "fast";
  safetyRail: boolean;  // Enforces no-medical, no-therapy
}

/**
 * Derives ToneEngine parameters based on the AAC Grammar.
 */
export function deriveToneEngineParams(grammar: AAC_Grammar): ToneEngineParams {
  let warmth = 5;
  let directness = 5;
  let humor = 3;

  if (grammar.ToneProfile === "gentle") { warmth = 9; directness = 2; humor = 2; }
  if (grammar.ToneProfile === "direct") { warmth = 3; directness = 9; humor = 1; }
  if (grammar.ToneProfile === "energetic") { warmth = 7; directness = 6; humor = 8; }
  if (grammar.ToneProfile === "calm") { warmth = 6; directness = 4; humor = 2; }
  if (grammar.ToneProfile === "playful") { warmth = 8; directness = 5; humor = 9; }

  if (grammar.EmotionalState === "stressed" || grammar.EmotionalState === "anxious") {
    warmth += 2;
    directness -= 2;
    humor = 1; // Drop humor if stressed
  }

  return {
    warmth: Math.min(10, warmth),
    directness: Math.max(0, directness),
    humor: Math.max(0, humor),
    pacing: grammar.Pacing,
    safetyRail: true
  };
}
