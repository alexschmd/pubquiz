import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";
import type { ReactNode } from "react";
import { ScoreboardPreview } from "./ScoreboardPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { QuestionFormEditor } from "./QuestionFormEditor";
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
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  Monitor,
  MessageSquare,
  Square,
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
import {
  parseQuestionList,
  validateQuestions,
  serializeQuestions,
  type PreparedQuestion,
} from "../lib/questions";
import { useQuestion, useRemainingSeconds } from "../context/QuestionContext";
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
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [editorMode, setEditorMode] = useState("text");
  const [formDraft, setFormDraft] = useState<PreparedQuestion[]>([]);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);
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
        if (!saved.durations || typeof saved.durations !== "object")
          throw new Error();
        setQuestions(
          saved.version === 2
            ? validateQuestions(saved.questions)
            : parseQuestionList(saved.text),
        );
        setDurations(saved.durations);
      }
    } catch {
      setBankError("Die gespeicherte Fragenliste konnte nicht geladen werden.");
    }
    setBankReady(true);
  }, []);
  const chosen = questions[selected];
  const remaining = useRemainingSeconds(question);
  const selectedIsActive =
    !!chosen &&
    question?.number === chosen.number &&
    question.text === chosen.text &&
    JSON.stringify(question.options ?? []) === JSON.stringify(chosen.options);
  const mainAction = !selectedIsActive
    ? "Frage starten"
    : remaining === 0
      ? question?.correctOptions?.length && !question.solutionRevealed
        ? "Lösung aufdecken"
        : "Zurück zum Leaderboard"
      : "Frage abbrechen";
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
    const nextQuestions = questions.map((item) =>
      item.number === chosen.number
        ? { ...item, correctOptions: correct }
        : item,
    );
    if (saveBank(nextQuestions, durations) && selectedIsActive)
      setCorrectOptions(correct);
  }
  function saveBank(
    nextQuestions: PreparedQuestion[],
    nextDurations: Record<number, string>,
  ) {
    try {
      localStorage.setItem(
        BANK_KEY,
        JSON.stringify({
          version: 2,
          questions: nextQuestions,
          durations: nextDurations,
        }),
      );
      setQuestions(nextQuestions);
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
    setFormDraft(structuredClone(questions));
    try {
      setDraft(serializeQuestions(questions));
      setEditorMode("text");
    } catch {
      setEditorMode("form");
    }
    setDraftError("");
    setOpen(true);
  }
  return (
    <section className="question-composer" aria-labelledby="question-title">
      <section className="question-session" aria-label="Laufende Frage">
        <ScoreboardPreview>
          <TooltipProvider delay={200}>
            <div
              className="preview-controls"
              role="group"
              aria-label="Vorschau steuern"
            >
              <PreviewControl
                label={
                  question?.pausedRemainingMs !== undefined
                    ? "Zeit fortsetzen"
                    : "Zeit stoppen"
                }
                disabled={!question || remaining === 0}
                onClick={toggleTimer}
              >
                {question?.pausedRemainingMs !== undefined ? (
                  <Play />
                ) : (
                  <Pause />
                )}
              </PreviewControl>
              <PreviewControl
                label="Zeit neu starten"
                disabled={!question}
                onClick={restartTimer}
              >
                <RotateCcw />
              </PreviewControl>
              <PreviewControl
                label={
                  !question || question.visible === false
                    ? "Zur Frage wechseln"
                    : "Zum Scoreboard wechseln"
                }
                disabled={!question}
                onClick={() => setQuestionVisible(question?.visible === false)}
              >
                {!question || question.visible === false ? (
                  <MessageSquare />
                ) : (
                  <Monitor />
                )}
              </PreviewControl>
              <PreviewControl
                label="Frage abbrechen"
                destructive
                disabled={!question}
                onClick={() => setAbortOpen(true)}
              >
                <Square />
              </PreviewControl>
            </div>
          </TooltipProvider>
        </ScoreboardPreview>
      </section>
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
            <FieldLabel htmlFor="question-number">
              Nächste Frage vorbereiten
            </FieldLabel>
            <div className="question-sequence">
              <Button
                variant="outline"
                size="icon"
                aria-label="Vorherige Frage"
                title="Vorherige Frage"
                disabled={selected === 0}
                onClick={() => setSelected((index) => index - 1)}
              >
                <ChevronLeft />
              </Button>
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
              <Button
                variant="outline"
                size="icon"
                aria-label="Nächste Frage"
                title="Nächste Frage"
                disabled={selected >= questions.length - 1}
                onClick={() => setSelected((index) => index + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
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
                  saveBank(questions, {
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
      {!!chosen?.options.length && (
        <div className="answer-reveal-controls answer-reveal-list">
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
      <div className="question-control-bar">
        <div className="question-start-controls">
          <Button
            variant={
              mainAction === "Frage abbrechen" ? "destructive" : "default"
            }
            disabled={!ready || !chosen}
            onClick={() => {
              if (mainAction === "Frage abbrechen") {
                setAbortOpen(true);
                return;
              }
              if (mainAction === "Lösung aufdecken") {
                revealSolution(true);
                return;
              }
              if (mainAction === "Zurück zum Leaderboard") {
                dismiss();
                return;
              }
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
            {mainAction === "Frage abbrechen" ? (
              <Square data-icon="inline-start" />
            ) : mainAction === "Lösung aufdecken" ? (
              <Eye data-icon="inline-start" />
            ) : mainAction === "Frage starten" ? (
              <Play data-icon="inline-start" />
            ) : (
              <Monitor data-icon="inline-start" />
            )}
            {mainAction}
          </Button>
        </div>
      </div>
      {(error || bankError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || bankError}</AlertDescription>
        </Alert>
      )}
      <AlertDialog open={abortOpen} onOpenChange={setAbortOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Frage abbrechen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die laufende Frage und der Countdown werden beendet. Auf dem
              Scoreboard erscheint wieder der Punktestand.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiterlaufen lassen</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                dismiss();
                setAbortOpen(false);
              }}
            >
              Frage abbrechen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fragen bearbeiten</DialogTitle>
            <DialogDescription>
              Fragen importieren oder einzeln bearbeiten und richtige Antworten
              markieren.
            </DialogDescription>
          </DialogHeader>
          <form
            id="question-bank-form"
            onSubmit={(event) => {
              event.preventDefault();
              try {
                const next =
                  editorMode === "text"
                    ? parseQuestionList(draft)
                    : validateQuestions(formDraft);
                if (saveBank(next, durations)) {
                  setSelected(0);
                  setOpen(false);
                }
              } catch (error) {
                setDraftError((error as Error).message);
              }
            }}
          >
            <Tabs
              value={editorMode}
              onValueChange={(value) => {
                try {
                  if (value === "form") setFormDraft(parseQuestionList(draft));
                  else setDraft(serializeQuestions(formDraft));
                  setEditorMode(String(value));
                  setDraftError("");
                } catch (error) {
                  setDraftError((error as Error).message);
                }
              }}
            >
              <TabsList>
                <TabsTrigger value="text">Textimport</TabsTrigger>
                <TabsTrigger value="form">Bearbeiten</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Field data-invalid={!!draftError}>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel htmlFor="quiz-question">Fragen</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
                    </Button>
                  </div>
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
                    markiert richtige Antworten. Mehrere sind möglich.
                    Leerzeilen werden übersprungen. Ohne Nummer wird automatisch
                    durchnummeriert.
                  </FieldDescription>
                </Field>
              </TabsContent>
              <TabsContent value="form">
                <QuestionFormEditor
                  questions={formDraft}
                  onChange={(items) => {
                    setFormDraft(items);
                    setDraftError("");
                  }}
                />
              </TabsContent>
            </Tabs>
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

function PreviewControl({
  destructive = false,
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  destructive?: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="preview-control-trigger"
            tabIndex={disabled ? 0 : undefined}
            aria-label={disabled ? label : undefined}
          />
        }
      >
        <Button
          variant={destructive ? "destructive" : "ghost"}
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
