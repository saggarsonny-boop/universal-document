// Neon serverless client. Lazy-resolves DATABASE_URL on first use so the
// Next.js build doesn't crash when the env var is absent (e.g. during a
// local typecheck without secrets). Once DATABASE_URL resolves, the
// connection is reused for the lifetime of the worker.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

function client(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  cached = neon(url);
  return cached;
}

// Tagged-template proxy that defers to the lazy client. The Neon SDK's
// type signature for tagged templates is preserved because the call shape
// is identical.
export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client() as unknown as (s: TemplateStringsArray, ...v: unknown[]) => any)(
    strings,
    ...values,
  )) as unknown as NeonQueryFunction<false, false>;
