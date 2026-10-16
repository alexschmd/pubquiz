import {
  type QuizQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
export function QuestionDisplay({ question }: { question: QuizQuestion }) {
  const remaining = useRemainingSeconds(question);
  return (
    <main className="question-display">
      <p className="eyebrow">Frage {question.number ?? 1}</p>
      <h1>{question.text}</h1>
      {!!question.options?.length && (
        <ol className="question-options">
          {question.options.map((option, index) => (
            <li key={String.fromCharCode(65 + index)}>
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
            </li>
          ))}
        </ol>
      )}
      <div
        className={`question-countdown${remaining > 0 && remaining <= 10 ? " countdown-urgent" : ""}`}
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
