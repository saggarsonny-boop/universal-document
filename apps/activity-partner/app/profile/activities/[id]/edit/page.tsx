// /profile/activities/[id]/edit — auth-gated wrapper for the edit form.
// Validates that the id segment is a UUID before rendering. The actual
// data fetch happens client-side from the user's GET /api/users/me/activities
// list (filtered to this id) so a deactivated row doesn't render at all.

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { EditActivityForm } from "./EditActivityForm";
import { HiveFooter } from "../../../../_lib/HiveFooter";
import { PAGE_MAIN, FOCUS_RING_CSS } from "../../../../_lib/activityFormStyles";
import { isUuid } from "@/lib/validation/activity";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/signup");

  const { id } = await params;
  if (!isUuid(id)) notFound();

  return (
    <main style={PAGE_MAIN}>
      <style>{FOCUS_RING_CSS}</style>
      <EditActivityForm id={id} />
      <HiveFooter />
    </main>
  );
}
