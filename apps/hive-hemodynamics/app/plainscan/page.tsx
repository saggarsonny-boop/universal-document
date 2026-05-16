"use client";

import { useState } from "react";
import ReportInput from "@/components/ReportInput";
import ResultsSummary from "@/components/ResultsSummary";
import FindingsTable from "@/components/FindingsTable";
import DoctorQuestions from "@/components/DoctorQuestions";
import RedFlagBox from "@/components/RedFlagBox";
import IllustrationDisplay from "@/components/IllustrationDisplay";
import PDFExport from "@/components/PDFExport";
import Disclaimer from "@/components/Disclaimer";
import type {
  ExplainPayload,
  ExplainRequestBody,
  ExplainResult,
} from "@/types/plainscan";

const GENERIC_ERROR =
  "Something went wrong. Please check your report and try again.";

export default function PlainScanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const submit = async (payload: ExplainRequestBody) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: ExplainPayload | null = null;
      try {
        data = (await res.json()) as ExplainPayload;
      } catch {
        setError(GENERIC_ERROR);
        return;
      }

      if (!res.ok) {
        const message =
          data && "error" in data && typeof data.error === "string"
            ? data.error
            : GENERIC_ERROR;
        setError(message);
        return;
      }

      if (data && "error" in data) {
        setError(data.error);
        return;
      }

      if (data) {
        setResult(data);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">HivePlainScan</p>
        <h1>Your radiology report, in plain English.</h1>
        <p className="lede">
          Paste, upload, or photograph a finalized imaging report. Get a clear
          summary, a finding-by-finding breakdown, questions to bring to your
          doctor, and a downloadable PDF. No diagnosis. No jargon. Free,
          forever.
        </p>
      </header>

      <ReportInput onSubmit={submit} disabled={loading} />

      {loading && (
        <div className="section" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Reading your report...
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <>
          <ResultsSummary result={result} />
          <IllustrationDisplay result={result} />
          <FindingsTable findings={result.findings} />
          <DoctorQuestions questions={result.questionsForDoctor} />
          <RedFlagBox redFlags={result.redFlags} />
          <PDFExport result={result} />
          <Disclaimer text={result.disclaimer} />
        </>
      )}

      {!result && !loading && !error && <Disclaimer />}
    </main>
  );
}
