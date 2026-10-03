# pandoc-ud compatibility matrix

This matrix describes the proof-of-concept mapping between Pandoc's AST and UD/iSDF v0.1.0.

| Construct | Pandoc → UD | UD → Pandoc | Current policy |
|---|---|---|---|
| Paragraph, plain text | Green | Green | Native `paragraph` block |
| Heading, plain text | Green | Green | Native `heading` block |
| Flat bullet/numbered list | Green | Green | Native `list` block |
| Simple table | Green | Green | Native `table` block |
| Code block | Green | Green | Native `code` block |
| Horizontal rule | Green | Green | Native `divider` block |
| Basic image | Green | Green | Native `image` block on UD input; Pandoc figures currently preserved exactly when complex |
| Bold / italics / links in a paragraph | Yellow | Green | Preserved exactly as a UD `custom` block containing the Pandoc AST; not flattened |
| Block quote | Yellow | Green | Preserved exactly as a UD `custom` block |
| Nested / complex lists | Yellow | Green | Preserved exactly as a UD `custom` block |
| Complex tables | Yellow | Green | Preserved exactly as a UD `custom` block |
| Figure/caption structures | Yellow | Green | Preserved exactly as a UD `custom` block |
| Citations / footnotes / raw blocks / Divs | Yellow | Green | Preserved exactly as a UD `custom` block |
| UD clarity layers | Green* | Green | Kept in the original UD JSON and exposed through Pandoc metadata during no-edit round trips |
| UD translations | Green* | Green | Same as above |
| UD provenance | Green* | Green | Same as above |
| UDR vs UDS state | Green* | Green | Same as above |
| UDS seal / chain of custody | Green* | Green | No-edit UD → Pandoc → UD returns original semantic JSON unchanged |

`Green*` means the concept is preserved as UD semantics, not reinterpreted as a native Pandoc AST concept.

## Why "Yellow" is not data loss

UD v0.1 intentionally has a small native block vocabulary. When Pandoc contains structure UD v0.1 cannot represent natively without flattening it, `pandoc-ud` stores the complete Pandoc block JSON inside a valid UD `custom` block with a preservation marker. On conversion back, the exact Pandoc block is reconstructed.

The trade-off is that today's ordinary UD Reader does not render every such custom block natively. This is therefore **preserved but not yet natively rendered**, rather than silently lost.

## Long-term schema implication

The experiment suggests a useful future UD design choice: either keep rich inline content as explicit interoperable custom structures, or add a first-class inline-content model to a later iSDF version. The prototype does not make that standards decision for UD; it makes the boundary measurable.
