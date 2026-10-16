import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "./ui/field";
import { Alert, AlertDescription } from "./ui/alert";
import { parseQuestionList, type PreparedQuestion } from "../lib/questions";
import {
  useQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
export function QuestionComposer() {
  const { question, ready, error, publish, dismiss, setQuestionVisible } =
    useQuestion();
  const [text, setText] = useState("");
  const [selected, setSelected] = useState(0);
  const [durations, setDurations] = useState<Record<number, string>>({});
  let questions: PreparedQuestion[] = [];
  let listError = "";
  try {
    questions = parseQuestionList(text);
  } catch (error) {
    listError = (error as Error).message;
  }
  const chosen = questions[selected];
  const duration = durations[selected] ?? "60";
  const remaining = useRemainingSeconds(question);
  return (
    <section className="question-composer" aria-labelledby="question-title">
      <h2 id="question-title">Fragen vorbereiten</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (chosen && !listError)
            publish(chosen.text, Number(duration), {
              number: chosen.number,
              options: chosen.options,
            });
        }}
      >
        <FieldGroup>
          <Field data-invalid={!!listError}>
            <FieldLabel htmlFor="quiz-question">Fragen</FieldLabel>
            <Textarea
              id="quiz-question"
              maxLength={50000}
              rows={7}
              className="question-list-input"
              aria-describedby="question-list-help"
              aria-invalid={!!listError}
              placeholder={
                "1. Welcher Planet ist der Sonne am nächsten?; (Merkur) (Venus) (Mars)\n2. Wer schrieb Faust?"
              }
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setSelected(0);
                setDurations({});
              }}
            />
            <FieldDescription id="question-list-help">
              Eine Frage pro Zeile. Optional nummerieren: 1. Frage; (Antwort A)
              (Antwort B). Ohne Nummer wird automatisch durchnummeriert.
              Leerzeilen werden übersprungen.
            </FieldDescription>
          </Field>
          {listError && (
            <Alert variant="destructive">
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          )}
          {!!questions.length && (
            <>
              <div className="question-selection">
                <Field>
                  <FieldLabel htmlFor="selected-question">
                    Frage auswählen
                  </FieldLabel>
                  <select
                    id="selected-question"
                    aria-label="Frage auswählen"
                    value={selected}
                    onChange={(event) =>
                      setSelected(Number(event.target.value))
                    }
                  >
                    {questions.map((item, index) => (
                      <option key={item.number} value={index}>
                        Frage {item.number}: {item.text}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  disabled={selected >= questions.length - 1}
                  onClick={() => setSelected((index) => index + 1)}
                >
                  Nächste Frage auswählen
                </Button>
              </div>
              <div className="question-preview">
                <span>Vorbereitet · Frage {chosen.number}</span>
                <p>{chosen.text}</p>
                {!!chosen.options.length && (
                  <ol>
                    {chosen.options.map((option, index) => (
                      <li key={String.fromCharCode(65 + index)}>
                        {String.fromCharCode(65 + index)} · {option}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
          <div className="question-send">
            <Field className="w-32 shrink-0">
              <FieldLabel htmlFor="question-duration">
                Dauer in Sekunden
              </FieldLabel>
              <Input
                id="question-duration"
                type="number"
                required
                min={1}
                max={3600}
                step={1}
                value={duration}
                onChange={(event) =>
                  setDurations((current) => ({
                    ...current,
                    [selected]: event.target.value,
                  }))
                }
              />
            </Field>
            <Button type="submit" disabled={!ready || !chosen || !!listError}>
              Frage starten
            </Button>
          </div>
        </FieldGroup>
      </form>
      {question && (
        <div className="active-question">
          <div>
            <span className="active-question-label">
              Frage {question.number ?? 1} ·{" "}
              {remaining ? formatCountdown(remaining) : "Zeit abgelaufen"}
            </span>
            <p>{question.text}</p>
          </div>
          <div className="question-view-controls">
            <Button
              variant={question.visible !== false ? "secondary" : "outline"}
              aria-pressed={question.visible !== false}
              onClick={() => setQuestionVisible(true)}
            >
              Frage anzeigen
            </Button>
            <Button
              variant={question.visible === false ? "secondary" : "outline"}
              aria-pressed={question.visible === false}
              onClick={() => setQuestionVisible(false)}
            >
              Scoreboard anzeigen
            </Button>
            <Button variant="ghost" onClick={dismiss}>
              Frage beenden
            </Button>
          </div>
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
