// Self-only profile view. The userId in the URL must match the signed-in
// user's hap_users.id; otherwise we 404 (we don't expose anyone else's
// profile in Phase 1, even via a known UUID).

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getHapUser } from "@/lib/auth";
import { stripForbidden } from "@/lib/profile";
import { LANGUAGES } from "@/lib/languages";
import { HiveFooter } from "../../_lib/HiveFooter";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

export const dynamic = "force-dynamic";

type ProfileRow = {
  display_name: string;
  bio: string | null;
  languages_spoken: string[];
  photo_url: string | null;
  is_open_to_romantic_interest: boolean;
  is_verified: boolean;
  verification_method: string | null;
  emergency_contact_encrypted: string | null;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const me = await getHapUser();
  if (!me) redirect("/profile/setup");
  if (me.id !== userId) notFound();

  const profileRows = (await sql`
    SELECT display_name, bio, languages_spoken, photo_url,
           is_open_to_romantic_interest, is_verified, verification_method,
           emergency_contact_encrypted
    FROM hap_profiles
    WHERE user_id = ${me.id}
    LIMIT 1
  `) as ProfileRow[];
  if (!profileRows[0]) redirect("/profile/setup");
  const profile = profileRows[0];

  // Defense-in-depth: even though we hand-picked columns above, the
  // canonical sanitizer runs to make sure no forbidden field can sneak
  // through if this query is ever extended.
  const safe = stripForbidden({ ...me, ...profile });

  const labelFor = (code: string) =>
    LANGUAGES.find((l) => l.code === code)?.label ?? code;

  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>{safe.display_name}</h1>

      <div style={badgeRowStyle}>
        <span style={badgeStyle}>{me.age_band}</span>
        {safe.is_verified ? <span style={verifiedBadgeStyle}>✓ Verified</span> : null}
        {!me.age_verified && me.age_band === "18-24" ? (
          <span style={pendingBadgeStyle}>Age verification pending</span>
        ) : null}
      </div>

      <Row label="City">
        {me.city}
        {me.neighborhood ? ` · ${me.neighborhood}` : ""}
      </Row>
      <Row label="Languages">
        {(safe.languages_spoken ?? []).map(labelFor).join(", ")}
      </Row>
      {profile.bio ? <Row label="About">{profile.bio}</Row> : null}
      <Row label="Open to romantic interest">
        {profile.is_open_to_romantic_interest ? "Yes" : "No"}
      </Row>
      <Row label="Emergency contact on file">
        {profile.emergency_contact_encrypted ? "Yes (encrypted)" : "Not set"}
      </Row>
      <Row label="Trust score">
        <span style={{ color: PAPER }}>{me.trust_score}</span>
        <span style={trustHintStyle}> · only visible to you</span>
      </Row>

      <Link href="/profile/setup" style={editLinkStyle}>
        Edit profile
      </Link>

      <p style={privacyStyle}>
        We never share your exact location, real name, or contact info with
        anyone until you explicitly accept a contact-share request.
      </p>
      <p style={privacyStyle}>
        All profiles are private. We do not index profiles in search engines or
        generate public profile pages.
      </p>

      <HiveFooter />
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={{ color: MUTED, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ color: PAPER, fontSize: 15, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "16px 20px 0",
};

const titleStyle: React.CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 28,
  color: PAPER,
  fontWeight: 600,
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 18,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  border: `1px solid ${GOLD}`,
  borderRadius: 999,
  color: GOLD,
  fontSize: 12,
  letterSpacing: "0.05em",
};

const verifiedBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: GOLD,
  color: "#0a0a0a",
};

const pendingBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  borderColor: MUTED,
  color: MUTED,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "12px 0",
  borderBottom: "1px solid #1f1f1f",
};

const trustHintStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 12,
};

const editLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 24,
  padding: "10px 16px",
  background: GOLD,
  color: "#0a0a0a",
  textDecoration: "none",
  borderRadius: 8,
  fontWeight: 500,
};

const privacyStyle: React.CSSProperties = {
  marginTop: 18,
  color: MUTED,
  fontSize: 12,
  lineHeight: 1.5,
};
