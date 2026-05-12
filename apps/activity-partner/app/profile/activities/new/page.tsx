// /profile/activities/new — auth-gated wrapper around the AddActivityFlow
// client component. Server-side redirect to /signup if no Clerk session.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddActivityFlow } from "./AddActivityFlow";
import { HiveFooter } from "../../../_lib/HiveFooter";
import { PAGE_MAIN, FOCUS_RING_CSS } from "../../../_lib/activityFormStyles";

export default async function AddActivityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/signup");

  return (
    <main style={PAGE_MAIN}>
      <style>{FOCUS_RING_CSS}</style>
      <AddActivityFlow />
      <HiveFooter />
    </main>
  );
}
