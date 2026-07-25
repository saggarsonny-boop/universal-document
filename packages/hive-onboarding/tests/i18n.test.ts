// Smoke tests for the i18n loader. Runs as plain Node (no test runner)
// via `node --import tsx tests/i18n.test.ts` or by invoking from a parent
// project. Zero-dependency — does not pull in @types/node.

// Minimal Node `process` shim so we can call .exit() without dragging in
// @types/node as a package devDep. Real Node provides this at runtime.
declare const process: { exit: (code: number) => never };

import { applyVars, applyVarsDeep, pickLocale, getStringsSync, CANONICAL_LOCALES } from "../src/i18n";

let failures = 0;
function check(label: string, cond: boolean): void {
  if (!cond) {
    failures += 1;
    console.error(`FAIL: ${label}`);
  } else {
    console.log(`ok: ${label}`);
  }
}

// applyVars
check("applyVars substitutes engineName", applyVars("Add {{engineName}}!", { engineName: "Foo" }) === "Add Foo!");
check("applyVars leaves missing key unsubstituted", applyVars("{{nope}}", { engineName: "X" }) === "{{nope}}");
check("applyVars handles multiple occurrences",
  applyVars("{{engineName}} loves {{engineName}}", { engineName: "Bar" }) === "Bar loves Bar");

// applyVarsDeep
const nested = { a: { b: "Hello {{engineName}}" }, c: "{{engineName}} world" };
const out = applyVarsDeep(nested, { engineName: "Hive" });
check("applyVarsDeep recurses into nested objects", out.a.b === "Hello Hive" && out.c === "Hive world");

// pickLocale
check("pickLocale picks primary subtag", pickLocale("es-MX") === "es");
check("pickLocale falls back to en for unknown", pickLocale("ja-JP") === "en");
check("pickLocale handles undefined", pickLocale(undefined) === "en");

// getStringsSync — every canonical locale should resolve
for (const code of CANONICAL_LOCALES) {
  const s = getStringsSync({ engineName: "TestEngine" }, code);
  check(`getStringsSync(${code}) returns install.cta with engineName substituted`,
    typeof s.install.cta === "string"
    && s.install.cta.includes("TestEngine")
    && !s.install.cta.includes("{{engineName}}"));
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log(`\nAll tests passed (${CANONICAL_LOCALES.length} locales x install.cta + 7 unit cases)`);
