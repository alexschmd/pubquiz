import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "./ui/field";
import { Alert, AlertDescription } from "./ui/alert";
import {
  useQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
export function QuestionComposer() {
  const { question, ready, error, publish, dismiss } = useQuestion();
  const [text, setText] = useState("");
  const [duration, setDuration] = useState("60");
  const [nextIndex, setNextIndex] = useState(0);
  const questions = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const nextQuestion = questions[nextIndex];
  const tooLong = questions.some((line) => line.length > 1000);
  const remaining = useRemainingSeconds(question);
  return (
    <section className="question-composer" aria-labelledby="question-title">
      <h2 id="question-title">Fragen vorbereiten</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (
            nextQuestion &&
            !tooLong &&
            publish(nextQuestion, Number(duration))
          )
            setNextIndex((index) => index + 1);
        }}
      >
        <FieldGroup>
          <Field data-invalid={tooLong}>
            <FieldLabel htmlFor="quiz-question">Fragen</FieldLabel>
            <Textarea
              id="quiz-question"
              required
              maxLength={50000}
              rows={7}
              className="question-list-input"
              aria-describedby="question-list-help"
              aria-invalid={tooLong}
              placeholder={
                "Welcher Planet ist der Sonne am nächsten?\nWie viele Bundesländer hat Deutschland?\nWer schrieb Faust?"
              }
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setNextIndex(0);
              }}
            />
            <FieldDescription id="question-list-help">
              Eine Frage pro Zeile. Leerzeilen werden übersprungen. Änderungen
              an der Liste starten die Reihenfolge neu.
              {tooLong && " Eine Frage darf höchstens 1000 Zeichen lang sein."}
            </FieldDescription>
          </Field>
          <div className="question-send">
            <Field className="w-32 shrink-0">
              <FieldLabel htmlFor="question-duration">
                Dauer in Sekunden
              </FieldLabel>
              <Input
                id="question-duration"
                type="number"
                min={1}
                max={3600}
                step={1}
                required
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </Field>
            <Button type="submit" disabled={!ready || !nextQuestion || tooLong}>
              {nextIndex === 0
                ? "Erste Frage starten"
                : nextQuestion
                  ? "Nächste Frage starten"
                  : "Alle Fragen gestellt"}
            </Button>
          </div>
          {questions.length > 0 && (
            <div className="question-queue-status">
              <p>
                {nextQuestion
                  ? `Als Nächstes (${nextIndex + 1}/${questions.length}): ${nextQuestion}`
                  : `Alle ${questions.length} Fragen wurden gestellt.`}
              </p>
              {nextIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNextIndex(0)}
                >
                  Von vorne beginnen
                </Button>
              )}
            </div>
          )}
        </FieldGroup>
      </form>
      {question && (
        <div className="active-question">
          <div>
            <span className="active-question-label">
              {remaining
                ? `Läuft · ${formatCountdown(remaining)}`
                : "Zeit abgelaufen"}
            </span>
            <p>{question.text}</p>
          </div>
          <Button variant="outline" onClick={dismiss}>
            Frage beenden
          </Button>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </section>
  );
}
