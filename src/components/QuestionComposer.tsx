import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
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
  const remaining = useRemainingSeconds(question);
  return (
    <section className="question-composer" aria-labelledby="question-title">
      <h2 id="question-title">Frage stellen</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          publish(text, Number(duration));
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="quiz-question">Frage</FieldLabel>
            <Input
              id="quiz-question"
              required
              maxLength={1000}
              placeholder="Was möchtest du die Teams fragen?"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
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
            <Button type="submit" disabled={!ready || !text.trim()}>
              {question ? "Neue Frage starten" : "Auf Scoreboard anzeigen"}
            </Button>
          </div>
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
