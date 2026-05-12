"use client";

import { useState } from "react";
import type { ExplainResult } from "@/types/plainscan";
import { generatePDF } from "@/lib/generatePDF";
import { downloadUDS } from "@/lib/generateUDS";

interface Props {
  result: ExplainResult;
}

export default function PDFExport({ result }: Props) {
  const [busy, setBusy] = useState<"pdf" | "uds" | null>(null);

  const handlePDF = () => {
    setBusy("pdf");
    try {
      generatePDF(result);
    } finally {
      setBusy(null);
    }
  };

  const handleUDS = () => {
    setBusy("uds");
    try {
      downloadUDS(result);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="actions" style={{ marginTop: "1.5rem" }}>
      <button
        type="button"
        className="btn"
        onClick={handlePDF}
        disabled={busy !== null}
      >
        {busy === "pdf" ? "Preparing PDF..." : "Download PDF Summary"}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleUDS}
        disabled={busy !== null}
      >
        {busy === "uds" ? "Preparing UDS..." : "Download as UDS"}
      </button>
    </div>
  );
}
