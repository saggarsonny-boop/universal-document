import { auth, clerkClient } from "@clerk/nextjs/server";

export const MAX_FREE_CREDITS = 5;

export type UserTier = "free" | "pro" | "premium";

export async function checkAndConsumeCredit(): Promise<{
  allowed: boolean;
  tier: UserTier;
  creditsUsed: number;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { allowed: false, tier: "free", creditsUsed: 0 };
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const metadata = user.publicMetadata as {
    tier?: UserTier;
    creditsUsed?: number;
  };

  const tier = metadata.tier || "free";
  const creditsUsed = metadata.creditsUsed || 0;

  if (tier === "premium" || tier === "pro") {
    // Pro/Premium get unlimited for now, or you can enforce Pro limits later.
    return { allowed: true, tier, creditsUsed };
  }

  if (creditsUsed >= MAX_FREE_CREDITS) {
    return { allowed: false, tier, creditsUsed };
  }

  // Increment credit asynchronously so it doesn't block
  (await clerkClient()).users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      creditsUsed: creditsUsed + 1,
    },
  }).catch((err) => console.error("Failed to update credit usage", err));

  return { allowed: true, tier, creditsUsed: creditsUsed + 1 };
}
