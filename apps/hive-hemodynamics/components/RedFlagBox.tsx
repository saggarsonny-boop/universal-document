interface Props {
  redFlags: string[];
}

export default function RedFlagBox({ redFlags }: Props) {
  if (redFlags.length === 0) return null;

  return (
    <aside
      className="red-flag-box"
      role="alert"
      aria-label="Findings that may need prompt attention"
    >
      <span className="red-flag-icon" aria-hidden="true">
        !
      </span>
      <div>
        <h2>
          The report you provided contains findings that may need prompt
          attention. Contact your doctor or care team.
        </h2>
        <ul>
          {redFlags.map((flag, idx) => (
            <li key={idx}>{flag}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
