// Clerk-hosted sign-in component, mounted at /sign-in.
// Existing users land here from the home-page link. New users go through
// /signup → /sign-up so the age band is captured first.

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <SignIn
        signUpUrl="/signup"
        forceRedirectUrl="/profile/setup"
      />
    </main>
  );
}
