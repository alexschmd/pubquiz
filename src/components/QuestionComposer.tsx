import { ButtonGroup, ButtonGroupText } from "./ui/button-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "./ui/select";
import { QUESTION_IMPORT_PROMPT } from "../lib/question-import-prompt";
import {
  Eye,
  EyeOff,
  Plus,
  ListChecks,
  Copy,
  Check,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "./ui/empty";
import { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
  InputGroupButton,
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
    toggleTimer,
    restartTimer,
    setCorrectOptions,
    revealSolution,
  } = useQuestion();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [preparedReveals, setPreparedReveals] = useState<
    Record<number, number[]>
  >({});
  const [durations, setDurations] = useState<Record<number, string>>({});
  const [bankReady, setBankReady] = useState(false);
  const [bankError, setBankError] = useState("");
  const [draftError, setDraftError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
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
  const selectedIsActive =
    !!chosen &&
    question?.number === chosen.number &&
    question.text === chosen.text &&
    JSON.stringify(question.options ?? []) === JSON.stringify(chosen.options);
  const visibleAnswers = selectedIsActive
    ? (question?.revealedOptions ?? [])
    : chosen
      ? (preparedReveals[chosen.number] ?? [])
      : [];
  function setAnswers(indices: number[]) {
    if (!chosen) return;
    setPreparedReveals((current) => ({ ...current, [chosen.number]: indices }));
    if (selectedIsActive) revealOptions(indices);
  }
  function markCorrect(index: number) {
    if (!chosen) return;
    const current = chosen.correctOptions ?? [];
    const correct = current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index];
    const nextText = questions
      .map((item) => {
        const answer =
          item.number === chosen.number ? correct : (item.correctOptions ?? []);
        return `${item.number}. ${item.text}${item.options.length ? `; ${item.options.map((option, i) => `(${option}${answer.includes(i) ? "*" : ""})`).join(" ")}` : ""}`;
      })
      .join("\n");
    if (saveBank(nextText, durations) && selectedIsActive)
      setCorrectOptions(correct);
  }
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
    setCopyState("idle");
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
        {!!questions.length && (
          <Button disabled={!bankReady} onClick={edit}>
            Fragen bearbeiten
          </Button>
        )}
      </div>
      {!!questions.length ? (
        <div className="question-compact-selection">
          <Field>
            <FieldLabel htmlFor="question-number">Frage auswählen</FieldLabel>
            <Select
              value={String(selected)}
              onValueChange={(value) => {
                if (value !== null) setSelected(Number(value));
              }}
              items={questions.map((item, index) => ({
                value: String(index),
                label: `Frage ${item.number}: ${item.text}`,
              }))}
            >
              <SelectTrigger id="question-number" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {questions.map((item, index) => (
                    <SelectItem key={item.number} value={String(index)}>
                      Frage {item.number}: {item.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="question-compact-duration">
            <FieldLabel htmlFor="selected-duration">Zeit</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="selected-duration"
                aria-label={`Zeit für Frage ${chosen.number}`}
                type="number"
                min={1}
                max={3600}
                step={1}
                value={durations[chosen.number] ?? "60"}
                onChange={(event) =>
                  saveBank(text, {
                    ...durations,
                    [chosen.number]: event.target.value,
                  })
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>Sek.</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>
      ) : (
        <Empty className="question-empty">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecks />
            </EmptyMedia>
            <EmptyTitle>Noch keine Fragen</EmptyTitle>
            <EmptyDescription>
              Bereite die Fragen für deinen Quizabend vor.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button disabled={!bankReady} onClick={edit}>
              <Plus data-icon="inline-start" />
              Fragen hinzufügen
            </Button>
          </EmptyContent>
        </Empty>
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
                  ...(!!chosen.correctOptions?.length
                    ? { correctOptions: chosen.correctOptions }
                    : {}),
                  revealedOptions: visibleAnswers,
                });
            }}
          >
            Frage starten
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
      {!!chosen?.options.length && (
        <div className="answer-reveal-controls answer-reveal-list">
          <span>
            Antworten · Frage {chosen.number}
            {selectedIsActive ? " · Live" : " · Beim Start sichtbar"}
          </span>
          <div>
            {chosen.options.map((option, index) => {
              const shown = visibleAnswers.includes(index);
              const label = String.fromCharCode(65 + index);
              return (
                <ButtonGroup
                  key={label}
                  aria-label={`Antwort ${label}`}
                  className="answer-segment-group"
                >
                  <Button
                    variant={shown ? "secondary" : "outline"}
                    size="icon"
                    aria-pressed={shown}
                    aria-label={`Antwort ${label} ${shown ? "verbergen" : "anzeigen"}`}
                    onClick={() =>
                      setAnswers(
                        shown
                          ? visibleAnswers.filter((item) => item !== index)
                          : [...visibleAnswers, index],
                      )
                    }
                  >
                    {shown ? <Eye /> : <EyeOff />}
                  </Button>
                  <ButtonGroupText>{label}</ButtonGroupText>
                  <ButtonGroupText className="answer-segment-text">
                    {option}
                  </ButtonGroupText>
                  <Button
                    variant={
                      chosen.correctOptions?.includes(index)
                        ? "secondary"
                        : "outline"
                    }
                    size="icon"
                    aria-pressed={chosen.correctOptions?.includes(index)}
                    aria-label={`Antwort ${label} ${chosen.correctOptions?.includes(index) ? "nicht mehr als richtig markieren" : "als richtig markieren"}`}
                    title="Richtige Antwort markieren"
                    onClick={() => markCorrect(index)}
                  >
                    <Check />
                  </Button>
                </ButtonGroup>
              );
            })}
            <ButtonGroup
              aria-label="Alle Antworten"
              className="answer-bulk-actions"
            >
              <Button
                variant="outline"
                onClick={() =>
                  setAnswers(chosen.options.map((_, index) => index))
                }
              >
                Alle anzeigen
              </Button>
              <Button variant="outline" onClick={() => setAnswers([])}>
                Alle verbergen
              </Button>
            </ButtonGroup>
          </div>
        </div>
      )}
      {!!chosen?.options.length && (
        <div className="solution-control">
          <p>
            Markiere mit den Haken alle richtigen Antworten. Beim Aufdecken
            werden sie grün hervorgehoben und die übrigen abgedimmt.
          </p>
          <Button
            variant="outline"
            disabled={!selectedIsActive || !question?.correctOptions?.length}
            onClick={() => revealSolution(!question?.solutionRevealed)}
          >
            {question?.solutionRevealed && selectedIsActive
              ? "Lösung verbergen"
              : "Lösung aufdecken"}
          </Button>
        </div>
      )}
      <div className="question-timer-controls">
        <Button
          variant="outline"
          disabled={!question || remaining === 0}
          onClick={toggleTimer}
        >
          {question?.pausedRemainingMs !== undefined ? (
            <Play data-icon="inline-start" />
          ) : (
            <Pause data-icon="inline-start" />
          )}
          {question?.pausedRemainingMs !== undefined
            ? "Zeit fortsetzen"
            : "Zeit stoppen"}
        </Button>
        <Button variant="outline" disabled={!question} onClick={restartTimer}>
          <RotateCcw data-icon="inline-start" />
          Zeit neu starten
        </Button>
      </div>
      <div className="question-screen-switch">
        <Button
          variant="outline"
          disabled={!question}
          onClick={() => setQuestionVisible(question?.visible === false)}
        >
          {!question || question.visible === false
            ? "Zur Frage wechseln"
            : "Zum Scoreboard wechseln"}
        </Button>
        <Button variant="ghost" disabled={!question} onClick={dismiss}>
          Frage beenden
        </Button>
      </div>
      <p className="question-live-status" role="status">
        {question
          ? `Frage ${question.number ?? 1} · ${question.pausedRemainingMs !== undefined ? `${formatCountdown(remaining)} · Gestoppt` : remaining ? formatCountdown(remaining) : "Zeit abgelaufen"}`
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
              <InputGroup>
                <InputGroupTextarea
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
                <InputGroupAddon align="block-end" className="justify-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          QUESTION_IMPORT_PROMPT,
                        );
                        setCopyState("copied");
                      } catch {
                        setCopyState("failed");
                      }
                    }}
                  >
                    {copyState === "copied" ? (
                      <Check data-icon="inline-start" />
                    ) : (
                      <Copy data-icon="inline-start" />
                    )}
                    {copyState === "copied"
                      ? "Prompt kopiert"
                      : "Prompt kopieren"}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p className="question-copy-status" role="status">
                {copyState === "failed"
                  ? "Kopieren nicht möglich. Den Prompt unten manuell kopieren."
                  : copyState === "copied"
                    ? "Prompt kopiert. Zusammen mit dem Fragendokument einer KI geben und das Ergebnis hier einfügen."
                    : "Mit dem Prompt kannst du ein Fragendokument von einer KI ins passende Format bringen lassen."}
              </p>
              {copyState === "failed" && (
                <Textarea
                  readOnly
                  aria-label="Prompt zum manuellen Kopieren"
                  value={QUESTION_IMPORT_PROMPT}
                  className="question-prompt-fallback"
                  onFocus={(event) => event.target.select()}
                />
              )}
              <FieldDescription id="question-list-help">
                Beispiel: 1. Frage; (Antwort A*) (Antwort B). Ein * am Ende
                markiert die richtige Antwort. Leerzeilen werden übersprungen.
                Ohne Nummer wird automatisch durchnummeriert.
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
