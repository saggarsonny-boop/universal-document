// @ts-nocheck
import type { Finding } from "@/types/plainscan";

interface Props {
  findings: Finding[];
}

function severityClass(level: Finding["severity"]): string {
  switch (level) {
    case "mild":
      return "severity-pill severity-mild";
    case "moderate":
      return "severity-pill severity-moderate";
    case "severe":
      return "severity-pill severity-severe";
    default:
      return "severity-pill";
  }
}

export default function FindingsTable({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <section className="section" aria-label="Findings">
        <h2>Findings</h2>
        <p style={{ color: "var(--muted)" }}>
          The report does not list discrete findings.
        </p>
      </section>
    );
  }

  return (
    <section className="section" aria-label="Findings">
      <h2>Findings</h2>
      <div style={{ overflowX: "auto" }}>
        <table className="findings-table">
          <thead>
            <tr>
              <th>Finding</th>
              <th>Plain English</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Possible Symptoms</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f, idx) => (
              <tr key={idx}>
                <td>{f.finding}</td>
                <td>{f.plainLanguage}</td>
                <td>{f.level ?? ""}</td>
                <td>
                  <span className={severityClass(f.severity)}>
                    {f.severity}
                  </span>
                </td>
                <td>
                  {f.possibleSymptoms.length > 0
                    ? f.possibleSymptoms.join(", ")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
