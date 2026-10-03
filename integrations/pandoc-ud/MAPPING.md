# Mapping policy

`pandoc-ud` follows one rule above all others:

> **Never silently throw document meaning away merely to claim a successful conversion.**

## Pandoc → UD

1. If a Pandoc block maps cleanly to the UD/iSDF v0.1 native block vocabulary, write a native UD block.
2. If native mapping would flatten meaningful structure or rich inline content, write a valid UD `custom` block whose `base_content.data.pandoc_json` contains a complete one-block Pandoc JSON document.
3. Record a human-readable warning in top-level `provenance.loss_warnings`.
4. Emit a UDR rather than pretending a newly converted document is cryptographically sealed.

## UD → Pandoc

1. Native UD blocks become the corresponding Pandoc blocks.
2. Recognized Pandoc preservation envelopes are reconstructed using Pandoc's JSON reader.
3. UD-only semantics such as clarity layers, translations, provenance, and seal information are exposed in Pandoc metadata.
4. When an existing UD file passes through Pandoc without a body edit, the writer returns the original UD JSON semantically unchanged. This prevents a harmless interoperability pass from accidentally destroying UD-only semantics.

## Editing after UD → Pandoc

If the Pandoc body changes, the adapter does **not** claim the old UDS seal remains valid. Instead it emits a fresh UDR mapping of the edited Pandoc document. This is important: an interoperability bridge must not create fake finality.

## What this POC does not claim

- It does not make Pandoc understand UD clarity layers or sealing natively.
- It does not make all UD custom blocks render in today's UD Reader.
- It does not promise pixel-identical DOCX/ODT round trips.
- It does not re-seal edited UDS files.
- It does not replace schema validation or the canonical UD sealing implementation.
