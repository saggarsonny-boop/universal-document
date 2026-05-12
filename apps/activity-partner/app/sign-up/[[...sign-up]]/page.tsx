// Clerk-hosted sign-up component, mounted at /sign-up.
// We arrive here from /signup, where the age band is already in
// sessionStorage. After Clerk creates the account it redirects to
// /profile/setup, where the age band is committed to hap_users.

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <SignUp
        signInUrl="/sign-in"
        forceRedirectUrl="/profile/setup"
      />
    </main>
  );
}
