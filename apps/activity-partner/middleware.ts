// Clerk middleware. Anything not in `isPublic` requires a signed-in session.
// /signup is public so the age-band gate runs before Clerk; the gate stores
// the selected age band in sessionStorage and forwards to /sign-up.
// /under-18 is public friction (we don't sign them up at all).

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/signup",
  "/under-18",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/api/activities/list",
  "/api/operator/login",
  "/_next/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/manifest.json",
  "/sw.js",
  "/(.*)\\.(png|jpg|jpeg|svg|webp|ico|json|txt|js)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
