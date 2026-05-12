// /profile/activities — list the signed-in user's activities. Auth-gated:
// if there's no Clerk session we redirect to /signup. The actual data
// fetch + render happens client-side via MyActivitiesList so the same
// component handles add/edit/deactivate refresh without a full reload.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MyActivitiesList } from "./MyActivitiesList";
import { HiveFooter } from "../../_lib/HiveFooter";
import { PAGE_MAIN, TITLE, LEAD, FOCUS_RING_CSS } from "../../_lib/activityFormStyles";

export default async function MyActivitiesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/signup");

  return (
    <main style={PAGE_MAIN}>
      <style>{FOCUS_RING_CSS}</style>
      <h1 style={TITLE}>Your activities</h1>
      <p style={LEAD}>
        The things you&rsquo;d like to do with someone. Add as many as you want;
        you can edit or remove any of them at any time.
      </p>
      <MyActivitiesList />
      <HiveFooter />
    </main>
  );
}
