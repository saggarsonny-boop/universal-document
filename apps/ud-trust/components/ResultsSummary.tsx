// @ts-nocheck
import type { ExplainResult } from "@/types/plainscan";

interface Props {
  result: ExplainResult;
}

export default function ResultsSummary({ result }: Props) {
  return (
    <section className="section" aria-label="Plain English summary">
      <p className="meta-row">
        {result.bodyRegion} / {result.reportType}
      </p>
      <h2>Plain English Summary</h2>
      <p style={{ lineHeight: 1.6, color: "var(--ink)" }}>{result.summary}</p>
    </section>
  );
}
