#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADAPTER="$ROOT/pandoc-ud.lua"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; exit 1; }

# 1) Existing UDS -> Pandoc -> UDS, no edits: semantic JSON must be identical.
pandoc -f "$ADAPTER" -t "$ADAPTER" "$ROOT/samples/existing-output.uds" > "$TMP/existing.roundtrip.uds"
python - "$ROOT/samples/existing-output.uds" "$TMP/existing.roundtrip.uds" <<'PY'
import json,sys
x=json.load(open(sys.argv[1])); y=json.load(open(sys.argv[2]))
assert x==y, 'semantic JSON differs'
PY
pass "existing sealed UDS survives no-edit round trip"

# 2) Rich UDR -> Pandoc -> UDR: clarity/translations must remain intact.
pandoc -f "$ADAPTER" -t "$ADAPTER" "$ROOT/samples/rich.udr" > "$TMP/rich.roundtrip.udr"
python - "$ROOT/samples/rich.udr" "$TMP/rich.roundtrip.udr" <<'PY'
import json,sys
x=json.load(open(sys.argv[1])); y=json.load(open(sys.argv[2]))
assert x==y, 'UD-only semantics changed'
assert y['blocks'][1]['clarity']['clinical']['en'].startswith('Admission for ACS')
assert 'es' in y['blocks'][1]['translations']
PY
pass "clarity layers and translations survive no-edit round trip"

# 3) Markdown -> UD: rich inline paragraph and block quote must not be silently flattened.
pandoc -f markdown -t "$ADAPTER" "$ROOT/samples/rich.md" > "$TMP/rich.from-md.udr"
python - "$TMP/rich.from-md.udr" <<'PY'
import json,sys
x=json.load(open(sys.argv[1]))
assert x['state']=='UDR'
assert x['provenance']['warning_count'] >= 2
custom=[b for b in x['blocks'] if b['type']=='custom']
assert custom, 'expected custom preservation blocks'
assert all(b['base_content']['data']['preservation']=='exact-pandoc-ast' for b in custom)
PY
pass "lossy Markdown constructs are preserved explicitly, not silently flattened"

# 4) Markdown -> UD -> Markdown: bold/link and block quote should come back.
pandoc -f "$ADAPTER" -t markdown "$TMP/rich.from-md.udr" > "$TMP/rich.back.md"
grep -q '\*\*bold\*\*' "$TMP/rich.back.md" || fail "bold did not round-trip"
grep -q '\[link\](https://example.com)' "$TMP/rich.back.md" || fail "link did not round-trip"
grep -q '^> A block quote' "$TMP/rich.back.md" || fail "block quote did not round-trip"
pass "rich Markdown content returns through UD"

# 5) DOCX and ODT paths through Pandoc into UD and back to Markdown.
pandoc "$ROOT/samples/rich.md" -o "$TMP/rich.docx"
pandoc "$ROOT/samples/rich.md" -o "$TMP/rich.odt"
for fmt in docx odt; do
  pandoc -f "$fmt" -t "$ADAPTER" "$TMP/rich.$fmt" > "$TMP/$fmt.udr"
  pandoc -f "$ADAPTER" -t markdown "$TMP/$fmt.udr" > "$TMP/$fmt.back.md"
  grep -q 'Contract Example' "$TMP/$fmt.back.md" || fail "$fmt heading lost"
  grep -q 'Simple item one' "$TMP/$fmt.back.md" || fail "$fmt list lost"
  pass "$fmt -> UD -> Markdown structural path"
done

# 6) Quality report should classify rich conversion as yellow, not red.
python3 "$ROOT/tools/quality_report.py" "$TMP/rich.from-md.udr" --json > "$TMP/report.json"
python - "$TMP/report.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
assert r['rating']=='yellow', r
assert r['unknown_blocks']==0, r
assert r['pandoc_ast_preservation_blocks'] >= 1, r
PY
pass "quality report identifies preserved-but-not-native constructs"

printf '\nAll pandoc-ud proof-of-concept tests passed.\n'
