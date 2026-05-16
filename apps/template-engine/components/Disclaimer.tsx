interface DisclaimerProps {
  text?: string;
}

const DEFAULT_TEXT =
  "This explanation is based on the radiology report you provided. It is for educational purposes only. It does not diagnose your condition, recommend treatment, or replace advice from your physician.";

export default function Disclaimer({ text = DEFAULT_TEXT }: DisclaimerProps) {
  return (
    <div className="disclaimer-box" role="note">
      <strong>Disclaimer:</strong> {text}
    </div>
  );
}
