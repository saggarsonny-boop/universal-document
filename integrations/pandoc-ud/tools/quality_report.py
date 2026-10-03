#!/usr/bin/env python3
"""Emit a small compatibility/loss report for a pandoc-ud generated UDR/UDS file."""
from __future__ import annotations
import argparse, json, pathlib, sys

NATIVE = {"paragraph", "heading", "list", "table", "image", "code", "divider"}

def report(doc: dict) -> dict:
    blocks = doc.get("blocks") or []
    warnings = ((doc.get("provenance") or {}).get("loss_warnings") or [])
    native = [b for b in blocks if b.get("type") in NATIVE]
    custom = [b for b in blocks if b.get("type") == "custom"]
    unsupported = [b for b in blocks if b.get("type") not in NATIVE | {"custom"}]
    return {
        "ud_version": doc.get("ud_version"),
        "state": doc.get("state"),
        "title": (doc.get("metadata") or {}).get("title"),
        "total_blocks": len(blocks),
        "native_ud_blocks": len(native),
        "pandoc_ast_preservation_blocks": len(custom),
        "unknown_blocks": len(unsupported),
        "warning_count": len(warnings),
        "warnings": warnings,
        "rating": "green" if not warnings and not unsupported else "yellow" if not unsupported else "red",
        "meaning": {
            "green": "Mapped natively to UD with no reported conversion warning.",
            "yellow": "Content was preserved, but one or more constructs needed an exact Pandoc AST preservation envelope instead of native UD v0.1 blocks.",
            "red": "At least one block is neither a native UD block nor a recognized Pandoc preservation envelope."
        }
    }

def as_markdown(r: dict) -> str:
    lines = [
        f"# pandoc-ud conversion report: {r.get('title') or 'Untitled'}",
        "",
        f"- Rating: **{str(r['rating']).upper()}**",
        f"- UD state: `{r.get('state')}`",
        f"- UD version: `{r.get('ud_version')}`",
        f"- Total blocks: {r['total_blocks']}",
        f"- Native UD blocks: {r['native_ud_blocks']}",
        f"- Exact Pandoc AST preservation blocks: {r['pandoc_ast_preservation_blocks']}",
        f"- Unknown blocks: {r['unknown_blocks']}",
        f"- Conversion warnings: {r['warning_count']}",
        "",
        r["meaning"][r["rating"]],
    ]
    if r["warnings"]:
        lines += ["", "## Warnings"] + [f"- {w}" for w in r["warnings"]]
    return "\n".join(lines) + "\n"

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file", type=pathlib.Path)
    ap.add_argument("--json", action="store_true", help="emit JSON instead of Markdown")
    ns = ap.parse_args()
    doc = json.loads(ns.file.read_text(encoding="utf-8"))
    r = report(doc)
    if ns.json:
        json.dump(r, sys.stdout, indent=2, ensure_ascii=False); print()
    else:
        sys.stdout.write(as_markdown(r))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
