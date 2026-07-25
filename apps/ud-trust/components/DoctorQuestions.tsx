// @ts-nocheck
interface Props {
  questions: string[];
}

export default function DoctorQuestions({ questions }: Props) {
  if (questions.length === 0) return null;

  return (
    <section className="section" aria-label="Questions for your doctor">
      <h2>Questions for Your Doctor</h2>
      <ol className="questions-list">
        {questions.map((q, idx) => (
          <li key={idx}>{q}</li>
        ))}
      </ol>
    </section>
  );
}
