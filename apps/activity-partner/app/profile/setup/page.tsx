// Profile setup. Loads the existing hap_users + hap_profiles row if there
// is one, otherwise renders an empty form. Submitting POSTs to /api/users
// (idempotent: creates the row on first save, updates on re-save).
// The age band comes from sessionStorage (set by /signup); if missing
// because the user landed here via Clerk-hosted UI without going through
// /signup, the form requires them to pick one inline.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileSetupForm } from "./ProfileSetupForm";
import { getHapUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { HiveFooter } from "../../_lib/HiveFooter";

const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

type ProfileRow = {
  display_name: string;
  bio: string | null;
  languages_spoken: string[];
  photo_url: string | null;
  is_open_to_romantic_interest: boolean;
};

export default async function ProfileSetup() {
  const { userId } = await auth();
  if (!userId) redirect("/signup");

  const hap = await getHapUser();
  let profile: ProfileRow | null = null;
  if (hap) {
    const rows = (await sql`
      SELECT display_name, bio, languages_spoken, photo_url, is_open_to_romantic_interest
      FROM hap_profiles
      WHERE user_id = ${hap.id}
      LIMIT 1
    `) as ProfileRow[];
    profile = rows[0] ?? null;
  }

  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>{hap ? "Edit your profile" : "Create your profile"}</h1>
      <p style={leadStyle}>
        Plain English. Anything optional says so. We never share your exact
        location, real name, or contact info with anyone until you explicitly
        accept a contact-share request.
      </p>

      <ProfileSetupForm
        existingHap={hap ? {
          ageBand: hap.age_band as "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+",
          city: hap.city,
          neighborhood: hap.neighborhood ?? "",
        } : null}
        existingProfile={profile ? {
          displayName: profile.display_name,
          bio: profile.bio ?? "",
          languagesSpoken: profile.languages_spoken ?? ["en"],
          photoUrl: profile.photo_url,
          isOpenToRomanticInterest: profile.is_open_to_romantic_interest,
        } : null}
      />
      <HiveFooter />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "16px 20px 0",
};

const titleStyle: React.CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 24,
  color: PAPER,
  fontWeight: 600,
};

const leadStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  color: MUTED,
  fontSize: 14,
  lineHeight: 1.55,
};
