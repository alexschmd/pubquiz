import { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "./ui/input-group";
import { Field, FieldLabel, FieldDescription } from "./ui/field";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { parseQuestionList } from "../lib/questions";
import {
  useQuestion,
  useRemainingSeconds,
  formatCountdown,
} from "../context/QuestionContext";
const BANK_KEY = "pubquiz-question-bank";
export function QuestionComposer() {
  const {
    question,
    ready,
    error,
    publish,
    dismiss,
    setQuestionVisible,
    revealOptions,
  } = useQuestion();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [durations, setDurations] = useState<Record<number, string>>({});
  const [bankReady, setBankReady] = useState(false);
  const [bankError, setBankError] = useState("");
  const [draftError, setDraftError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BANK_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          typeof saved.text !== "string" ||
          !saved.durations ||
          typeof saved.durations !== "object"
        )
          throw new Error();
        parseQuestionList(saved.text);
        setText(saved.text);
        setDurations(saved.durations);
      }
    } catch {
      setBankError("Die gespeicherte Fragenliste konnte nicht geladen werden.");
    }
    setBankReady(true);
  }, []);
  const questions = parseQuestionList(text);
  const chosen = questions[selected];
  const remaining = useRemainingSeconds(question);
  function saveBank(nextText: string, nextDurations: Record<number, string>) {
    try {
      localStorage.setItem(
        BANK_KEY,
        JSON.stringify({ text: nextText, durations: nextDurations }),
      );
      setText(nextText);
      setDurations(nextDurations);
      setBankError("");
      return true;
    } catch {
      setBankError("Die Fragenliste konnte nicht gespeichert werden.");
      return false;
    }
  }
  function edit() {
    setDraft(text);
    setDraftError("");
    setOpen(true);
  }
  return (
    <section className="question-composer" aria-labelledby="question-title">
      <div className="question-list-heading">
        <h2 id="question-title">
          Fragen <span>{questions.length}</span>
        </h2>
        <Button disabled={!bankReady} onClick={edit}>
          {questions.length ? "Fragen bearbeiten" : "Fragen hinzufügen"}
        </Button>
      </div>
      {!!questions.length ? (
        <ol className="prepared-question-list">
          {questions.map((item, index) => (
            <li key={item.number} data-selected={selected === index}>
              <Button
                variant="ghost"
                className="question-pick"
                aria-label={`Frage ${item.number}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span>Frage {item.number}</span>
              </Button>
              <div className="question-row-duration">
                <InputGroup>
                  <InputGroupInput
                    aria-label={`Zeit für Frage ${item.number}`}
                    type="number"
                    min={1}
                    max={3600}
                    step={1}
                    value={durations[item.number] ?? "60"}
                    onChange={(event) =>
                      saveBank(text, {
                        ...durations,
                        [item.number]: event.target.value,
                      })
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>Sek.</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="question-list-empty">
          Noch keine Fragen. Füge deine Fragen über den Dialog hinzu.
        </p>
      )}
      <div className="question-control-bar">
        <div className="question-start-controls">
          <Button
            disabled={!ready || !chosen}
            onClick={() => {
              if (chosen)
                publish(chosen.text, Number(durations[chosen.number] ?? 60), {
                  number: chosen.number,
                  options: chosen.options,
                });
            }}
          >
            Frage starten
          </Button>
          <span>
            {chosen
              ? `Ausgewählt: Frage ${chosen.number}`
              : "Keine Frage ausgewählt"}
          </span>
        </div>
        <div className="question-view-controls">
          <Button
            variant={
              question?.visible !== false && question ? "secondary" : "outline"
            }
            disabled={!question}
            aria-pressed={!!question && question.visible !== false}
            onClick={() => setQuestionVisible(true)}
          >
            Frage anzeigen
          </Button>
          <Button
            variant={
              !question || question.visible === false ? "secondary" : "outline"
            }
            aria-pressed={!question || question.visible === false}
            onClick={() => setQuestionVisible(false)}
          >
            Scoreboard anzeigen
          </Button>
          <Button variant="ghost" disabled={!question} onClick={dismiss}>
            Frage beenden
          </Button>
        </div>
      </div>
      {!!question?.options?.length && (
        <div className="answer-reveal-controls">
          <span>Antworten freigeben · Frage {question.number ?? 1}</span>
          <div>
            {question.options.map((option, index) => {
              const shown = question.revealedOptions?.includes(index) ?? false;
              return (
                <Button
                  key={String.fromCharCode(65 + index)}
                  variant={shown ? "secondary" : "outline"}
                  aria-pressed={shown}
                  aria-label={`Antwort ${String.fromCharCode(65 + index)} ${shown ? "verbergen" : "anzeigen"}`}

                  onClick={() =>
                    revealOptions(
                      shown
                        ? (question.revealedOptions ?? []).filter(
                            (item) => item !== index,
                          )
                        : [...(question.revealedOptions ?? []), index],
                    )
                  }
                >
                  {String.fromCharCode(65 + index)} ·{" "}
                  {shown ? "Sichtbar" : "Anzeigen"}
                </Button>
              );
            })}
            <Button
              variant="outline"
              onClick={() =>
                revealOptions(question.options!.map((_, index) => index))
              }
            >
              Alle anzeigen
            </Button>
            <Button variant="ghost" onClick={() => revealOptions([])}>
              Alle verbergen
            </Button>
          </div>
        </div>
      )}
      <p className="question-live-status" role="status">
        {question
          ? `Frage ${question.number ?? 1} · ${remaining ? formatCountdown(remaining) : "Zeit abgelaufen"}`
          : "Scoreboard wird angezeigt"}
      </p>
      {(error || bankError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || bankError}</AlertDescription>
        </Alert>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fragen bearbeiten</DialogTitle>
            <DialogDescription>
              Eine Frage pro Zeile. Nummern und Antworten sind optional.
            </DialogDescription>
          </DialogHeader>
          <form
            id="question-bank-form"
            onSubmit={(event) => {
              event.preventDefault();
              try {
                parseQuestionList(draft);
                if (saveBank(draft, durations)) {
                  setSelected(0);
                  setOpen(false);
                }
              } catch (error) {
                setDraftError((error as Error).message);
              }
            }}
          >
            <Field data-invalid={!!draftError}>
              <FieldLabel htmlFor="quiz-question">Fragen</FieldLabel>
              <Textarea
                id="quiz-question"
                maxLength={50000}
                rows={10}
                className="question-list-input"
                aria-invalid={!!draftError}
                aria-describedby="question-list-help"
                placeholder={
                  "1. Welcher Planet?; (Merkur) (Venus) (Mars)\n2. Wer schrieb Faust?"
                }
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setDraftError("");
                }}
              />
              <FieldDescription id="question-list-help">
                Beispiel: 1. Frage; (Antwort A) (Antwort B). Leerzeilen werden
                übersprungen. Ohne Nummer wird automatisch durchnummeriert.
              </FieldDescription>
            </Field>
            {draftError && (
              <p role="alert" className="question-form-error">
                {draftError}
              </p>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" form="question-bank-form">
              Fragen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
