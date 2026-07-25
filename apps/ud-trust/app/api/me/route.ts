import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { MAX_FREE_CREDITS, UserTier } from "@/lib/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ allowed: false, tier: "free", creditsUsed: 0, maxCredits: MAX_FREE_CREDITS });
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const metadata = user.publicMetadata as {
    tier?: UserTier;
    creditsUsed?: number;
  };

  const tier = metadata.tier || "free";
  const creditsUsed = metadata.creditsUsed || 0;

  return NextResponse.json({
    allowed: tier === "pro" || tier === "premium" || creditsUsed < MAX_FREE_CREDITS,
    tier,
    creditsUsed,
    maxCredits: MAX_FREE_CREDITS
  });
}
