# pandoc-ud

Proof-of-concept interoperability bridge between [Pandoc](https://pandoc.org/) and Universal Document (UD/iSDF v0.1.0).

The goal is deliberately modest: prove that UD can participate in the existing document ecosystem **without** asking Pandoc to adopt UD as a built-in format, and without silently discarding structure that UD v0.1 cannot yet represent natively.

## What it does

`pandoc-ud.lua` is both a Pandoc custom reader and custom writer.

Examples:

```bash
# UD → Markdown
pandoc -f ./pandoc-ud.lua -t markdown document.uds -o document.md

# DOCX → UD reviewable state
pandoc -f docx -t ./pandoc-ud.lua contract.docx -o contract.udr

# ODT → UD
pandoc -f odt -t ./pandoc-ud.lua report.odt -o report.udr

# UD → DOCX
pandoc -f ./pandoc-ud.lua -t docx document.udr -o document.docx
```

Pandoc includes its own Lua runtime, so users do not need to install Lua separately.

## Preservation strategy

UD/iSDF v0.1 has a deliberately small native block vocabulary. Pandoc has a richer AST.

This bridge therefore uses two modes:

1. **Native mapping** for structures that fit UD cleanly, such as plain headings, plain paragraphs, flat lists, simple tables, code blocks, and dividers.
2. **Exact preservation envelopes** for structures that would otherwise be flattened, such as rich inline formatting, links, block quotes, nested lists, complex tables, figures, citations, footnotes, raw content, and other Pandoc-specific structures.

The preservation envelope is a valid UD `custom` block containing a complete one-block Pandoc JSON document. Conversion warnings are written to `provenance.loss_warnings`. "Warning" therefore means "not natively representable in UD v0.1," not "silently discarded."

See [COMPATIBILITY.md](./COMPATIBILITY.md) and [MAPPING.md](./MAPPING.md).

## UD-only semantics

UD concepts such as:

- clarity layers;
- multilingual translations;
- provenance;
- UDR vs UDS state;
- UDS seal and chain of custody;

are not native Pandoc concepts. The reader exposes them through Pandoc metadata, and a no-edit UD → Pandoc → UD pass returns the original UD semantic JSON unchanged.

If the Pandoc body is edited, the writer emits a **new UDR**, not a falsely "still sealed" UDS.

## Conversion-quality report

After converting into UD:

```bash
python3 tools/quality_report.py contract.udr
```

The report is deliberately simple:

- **GREEN**: native UD mapping with no reported warning.
- **YELLOW**: content preserved, but at least one construct needed a Pandoc AST preservation envelope.
- **RED**: an unknown/unrecognized block remains.

## Tests

Requirements:

- Pandoc with Lua support. POC tested with Pandoc 3.1.11.1.
- Python 3 for semantic JSON assertions and the quality reporter.

Run:

```bash
./tests/run.sh
```

The suite checks:

1. existing sealed UDS survives a no-edit round trip;
2. clarity layers and translations survive a no-edit rich UDR round trip;
3. rich Markdown is preserved explicitly rather than silently flattened;
4. bold, links, and block quotes return through UD;
5. DOCX → UD → Markdown structural path;
6. ODT → UD → Markdown structural path.

## Current status

This is a proof of concept, not an official Pandoc reader/writer and not yet part of the UD standard.

The useful next questions are now empirical rather than theoretical: which constructs deserve first-class UD representation, which should remain interoperable custom blocks, and what compatibility guarantees should UD publish for each source format?
