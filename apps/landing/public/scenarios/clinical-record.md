# The Discharge Summary
### A document that knows who is reading it

---

James Osei is discharged from hospital on a Tuesday morning. The junior doctor writes his discharge summary — chief complaint, diagnosis, medications, follow-up instructions — not as positioned text on a page, but as structured semantic blocks. A heading. A clinical narrative. A medication list. A follow-up instruction. Each block is a discrete, machine-readable object. The file is a `.udr`: revisable, living, not yet sealed.

**creator.hive.baby** — James's summary is authored as a Universal Document. Every section is a block. The document knows what it contains.

---

James speaks Twi. The ward coordinator opens the translation tool and selects Twi as a parallel language. Claude translates the document block by block, preserving the clinical structure. The Twi version is not a separate file. It is not an attachment. It is a second stream inside the same document — the English and Twi sitting side by side in the block tree, two languages, one file.

**utilities.hive.baby/translate** — Twi added as a parallel stream. The file is unchanged. The document now knows two languages.

---

The physician seals the document. A SHA-256 hash is computed across the entire block tree. A registry record is written. The `.udr` becomes a `.uds`: Universal Document Sealed. Immutable. Tamper-evident. The seal includes the physician's identifier and a timestamp. The document is now a fact.

**signer.hive.baby** — Hash: `a3f8c2d1…91d4`. Registry record written. The document cannot be altered without the alteration being visible.

---

James opens the document on his phone. The Reader detects his device language. Twi renders automatically. He reads his own discharge summary in his own language, from the same file the hospital issued.

His pharmacist opens the same file. The Reader detects a clinical context. The English medication list is prominent. The pharmacist sees the drug names, the doses, the instructions.

His insurer opens the same file. The structured metadata is machine-readable. The insurer's system extracts what it needs without parsing prose.

**reader.hive.baby** — One file. Three readers. Each sees what they need. The hash is verified against the registry on every open. The document is confirmed unchanged.

---

A week later, the cardiologist reviews James's case and adjusts his amlodipine dose. The original discharge summary is now incorrect. The registry revocation is recorded server-side. Every Reader instance that opens the original file now shows the revocation banner — across every device, in every language, for every reader.

**utilities.hive.baby/revoke** — Registry revoked. Reason: medication update. Superseding document linked. The original remains readable, but its status is clear.

---

The document travels. The correction travels with it. The error does not persist.

This is what PDF cannot do.

---

*Universal Document™ Incorporated · April 2026 · CC BY 4.0*
