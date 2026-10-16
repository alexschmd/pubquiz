import {
  useQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
export function QuestionDisplay() {
  const { question } = useQuestion();
  const remaining = useRemainingSeconds(question);
  if (!question) return null;
  return (
    <main className="question-display">
      <p className="eyebrow">PUBQUIZ · FRAGE</p>
      <h1>{question.text}</h1>
      <div
        className="question-countdown"
        role="timer"
        aria-label="Verbleibende Zeit"
      >
        {formatCountdown(remaining)}
      </div>
      <p className="question-time-label" role="status">
        {remaining === 0 ? "Zeit abgelaufen" : "Verbleibende Zeit"}
      </p>
    </main>
  );
}
