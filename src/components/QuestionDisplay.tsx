import { useMemo } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import {
  type QuizQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
export function QuestionDisplay({ question }: { question: QuizQuestion }) {
  const remaining = useRemainingSeconds(question);
  const reduceMotion = useReducedMotion();
  const urgent =
    remaining > 0 &&
    remaining <= 10 &&
    question.pausedRemainingMs === undefined;
  const pulseDelay = useMemo(
    () => `-${(((Date.now() - question.endsAt) % 1000) + 1000) % 1000}ms`,
    [question.endsAt, urgent],
  );
  const shown = (question.options ?? [])
    .map((text, index) => ({ text, index }))
    .filter((option) => question.revealedOptions?.includes(option.index));
  return (
    <main
      className={`question-display${shown.length ? " question-with-answers" : ""}`}
    >
      <p className="eyebrow">Frage {question.number ?? 1}</p>
      <h1>{question.text}</h1>
      <AnimatePresence>
        {!!shown.length && (
          <m.ol
            className="question-options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            {shown.map((option) => (
              <m.li
                layout
                data-solution={
                  question.solutionRevealed
                    ? question.correctOption === option.index
                      ? "correct"
                      : "incorrect"
                    : undefined
                }
                key={option.index}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
              >
                <span>{String.fromCharCode(65 + option.index)}</span>
                {option.text}
                {question.solutionRevealed &&
                  question.correctOption === option.index && (
                    <span
                      className="solution-check"
                      aria-label="Richtige Antwort"
                    >
                      ✓
                    </span>
                  )}
              </m.li>
            ))}
          </m.ol>
        )}
      </AnimatePresence>
      <m.div
        layout
        className="question-timer-position"
        transition={{
          layout: {
            type: "spring",
            duration: reduceMotion ? 0 : 0.65,
            bounce: 0.15,
          },
        }}
      >
        <div
          className={`question-countdown${urgent ? " countdown-urgent" : ""}`}
          style={{ animationDelay: pulseDelay }}
          role="timer"
          aria-label="Verbleibende Zeit"
        >
          {formatCountdown(remaining)}
        </div>
        <p className="question-time-label" role="status">
          {question.pausedRemainingMs !== undefined
            ? "Zeit gestoppt"
            : remaining === 0
              ? "Zeit abgelaufen"
              : "Verbleibende Zeit"}
        </p>
      </m.div>
    </main>
  );
}
