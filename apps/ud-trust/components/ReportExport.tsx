// @ts-nocheck
"use client";

// ReportExport â€” formerly PDFExport. Renamed because UDS is now the
// canonical default download (per the paywall Phase 1 spec) and PDF is
// the secondary universal-format option. The two buttons differ in
// visual weight: the UDS button is the primary CTA (Hive gold, larger,
// prominent), the PDF button is a smaller outlined secondary action.
//
// Below the buttons we explain the choice in one line: UDS is
// tamper-evident; PDF is universal. Users downloading for clinician
// hand-off should default to UDS so the doctor's UD-aware viewer
// renders the chain-of-custody seal; patients who just want a printable
// keepsake pick PDF.

import { useState } from "react";
import type { ExplainResult } from "@/types/plainscan";
import { generatePDF } from "@/lib/generatePDF";
import { downloadUDS } from "@/lib/generateUDS";

const HIVE_GOLD = "#D4AF37";
const HIVE_INK = "#0a0a0a";

interface Props {
  result: ExplainResult;
}

export default function ReportExport({ result }: Props) {
  const [busy, setBusy] = useState<"pdf" | "uds" | null>(null);

  const handleUDS = async () => {
    setBusy("uds");
    try {
      await downloadUDS(result);
    } finally {
      setBusy(null);
    }
  };

  const handlePDF = () => {
    setBusy("pdf");
    try {
      generatePDF(result);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="actions" style={{ marginTop: "1.5rem" }} data-component="ReportExport">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* PRIMARY â€” UDS, Hive gold, ~2x prominence (larger font, taller, gold) */}
        <button
          type="button"
          onClick={handleUDS}
          disabled={busy !== null}
          aria-describedby="report-export-explainer"
          style={{
            background: HIVE_GOLD,
            color: HIVE_INK,
            border: 0,
            borderRadius: 12,
            padding: "14px 22px",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.02em",
            cursor: busy !== null ? "not-allowed" : "pointer",
            opacity: busy !== null ? 0.7 : 1,
            minWidth: 220,
          }}
        >
          {busy === "uds" ? "Preparing UDSâ€¦" : "Download UDS"}
        </button>

        {/* SECONDARY â€” PDF, outlined, smaller */}
        <button
          type="button"
          onClick={handlePDF}
          disabled={busy !== null}
          aria-describedby="report-export-explainer"
          style={{
            background: "transparent",
            color: HIVE_INK,
            border: `1px solid ${HIVE_INK}`,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: busy !== null ? "not-allowed" : "pointer",
            opacity: busy !== null ? 0.6 : 1,
          }}
        >
          {busy === "pdf" ? "Preparing PDFâ€¦" : "Download PDF"}
        </button>
      </div>
      <p
        id="report-export-explainer"
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#5a5e66",
          maxWidth: 520,
          lineHeight: 1.5,
        }}
      >
        UDS is the secure, tamper-evident format. PDF is the universal format.
      </p>
    </div>
  );
}
