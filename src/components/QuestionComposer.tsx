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
import { QuestionMiniList } from "./QuestionMiniList";
import { QUESTION_IMPORT_PROMPT } from "../lib/question-import-prompt";
import {
  Eye,
  EyeOff,
  Plus,
  ListChecks,
  Pencil,
  Copy,
  Check,
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
import { Skeleton } from "./ui/skeleton";
import { QuestionControlsSkeleton } from "./LoadingSkeletons";
import { BANK_KEY } from "../lib/question-bank";
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
    updateDuration,
    syncActiveQuestion,
    setCorrectOptions,
    revealSolution,
  } = useQuestion();
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);
  const [editorMode, setEditorMode] = useState("text");
  const [formDraft, setFormDraft] = useState<PreparedQuestion[]>([]);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [preparedReveals, setPreparedReveals] = useState<
    Record<number, number[]>
  >({});
  const [durations, setDurations] = useState<Record<number, string>>({});
  const [played, setPlayed] = useState<number[]>([]);
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
        const loaded =
          saved.version === 2
            ? validateQuestions(saved.questions)
            : parseQuestionList(saved.text);
        const savedPlayed: number[] = Array.isArray(saved.played)
          ? saved.played.filter((n: unknown) => typeof n === "number")
          : [];
        setQuestions(loaded);
        setDurations(saved.durations);
        setPlayed(savedPlayed);
        // Resume at the first question that hasn't been started yet.
        const firstOpen = loaded.findIndex(
          (item) => !savedPlayed.includes(item.number),
        );
        if (firstOpen > 0) setSelected(firstOpen);
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
    JSON.stringify(question.options ?? []) === JSON.stringify(chosen.options) &&
    (question.solution ?? "") === (chosen.solution ?? "");
  const hasSolution = Boolean(
    question?.correctOptions?.length || question?.solution,
  );
  const timerPaused = question?.pausedRemainingMs !== undefined;
  const timerLabel = !timerPaused
    ? "Zeit stoppen"
    : question?.pausedRemainingMs === question?.durationMs
      ? "Zeit starten"
      : "Zeit fortsetzen";
  const timerRunning = !!question && question.pausedRemainingMs === undefined;
  const activeIndex =
    question?.number === undefined
      ? -1
      : questions.findIndex((item) => item.number === question.number);
  // A question counts as played once its time has actually started running.
  useEffect(() => {
    const number = question?.number;
    if (!bankReady || !timerRunning || number === undefined) return;
    if (played.includes(number) || !questions.some((q) => q.number === number))
      return;
    saveBank(questions, durations, [...played, number]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankReady, timerRunning, question?.number, played, questions]);
  function showChosen() {
    if (!chosen) return;
    publish(chosen.text, Number(durations[chosen.number] ?? 60), {
      number: chosen.number,
      options: chosen.options,
      ...(!!chosen.correctOptions?.length
        ? { correctOptions: chosen.correctOptions }
        : {}),
      ...(chosen.solution ? { solution: chosen.solution } : {}),
      revealedOptions: visibleAnswers,
      startPaused: true,
    });
  }
  const mainAction = !selectedIsActive
    ? "Frage anzeigen"
    : remaining === 0
      ? hasSolution && !question?.solutionRevealed
        ? "Lösung aufdecken"
        : "Zurück zum Scoreboard"
      : timerLabel;
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
    nextPlayed: number[] = played,
  ) {
    const keptPlayed = nextPlayed.filter((number) =>
      nextQuestions.some((item) => item.number === number),
    );
    try {
      localStorage.setItem(
        BANK_KEY,
        JSON.stringify({
          version: 2,
          questions: nextQuestions,
          durations: nextDurations,
          played: keptPlayed,
        }),
      );
      setQuestions(nextQuestions);
      setDurations(nextDurations);
      setPlayed(keptPlayed);
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
      <section className="question-session" aria-labelledby="preview-title">
        <div className="question-list-heading">
          <h2 id="preview-title">Vorschau</h2>
        </div>
        <ScoreboardPreview>
          <TooltipProvider delay={200}>
            <div
              className="preview-controls"
              role="group"
              aria-label="Vorschau steuern"
            >
              <PreviewControl
                label={timerLabel}
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
        <div className="section-title">
          <h2 id="question-title">Fragen</h2>
          <span className="section-count">
            {bankReady ? (
              questions.length
            ) : (
              <Skeleton className="inline-block h-3.5 w-5 align-middle" />
            )}
          </span>
        </div>
        {bankReady && !!questions.length && (
          <Button variant="ghost" onClick={edit}>
            <Pencil data-icon="inline-start" />
            Fragen bearbeiten
          </Button>
        )}
      </div>
      {!bankReady ? (
        <QuestionControlsSkeleton />
      ) : !!questions.length ? (
        <div className="question-compact-selection">
          <Field>
            <div className="question-list-label">
              <FieldLabel htmlFor="question-number">Nächste Frage</FieldLabel>
              {!!played.length && (
                <span className="question-played-summary">
                  {played.length} von {questions.length} gespielt
                  <Button
                    variant="link"
                    size="xs"
                    onClick={() => saveBank(questions, durations, [])}
                  >
                    Zurücksetzen
                  </Button>
                </span>
              )}
            </div>
            <QuestionMiniList
              id="question-number"
              questions={questions}
              selected={selected}
              onSelect={setSelected}
              played={new Set(played)}
            />
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
                onChange={(event) => {
                  const value = event.target.value;
                  saveBank(questions, {
                    ...durations,
                    [chosen.number]: value,
                  });
                  const seconds = Number(value);
                  if (
                    selectedIsActive &&
                    value.trim() !== "" &&
                    Number.isInteger(seconds) &&
                    seconds >= 1 &&
                    seconds <= 3600
                  ) {
                    updateDuration(seconds);
                  }
                }}
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
      {!!chosen && !chosen.options.length && !!chosen.solution && (
        <div className="question-solution-hint">
          <span className="question-solution-hint-label">Lösung</span>
          <span>{chosen.solution}</span>
        </div>
      )}
      {!!chosen && (
        <div className="question-control-bar">
          <div className="question-start-controls">
            <Button
              disabled={!ready || !chosen}
              onClick={() => {
                if (
                  mainAction === "Zeit starten" ||
                  mainAction === "Zeit fortsetzen" ||
                  mainAction === "Zeit stoppen"
                ) {
                  toggleTimer();
                  return;
                }
                if (mainAction === "Lösung aufdecken") {
                  revealSolution(true);
                  return;
                }
                if (mainAction === "Zurück zum Scoreboard") {
                  dismiss();
                  const nextAfter = questions.findIndex(
                    (item, index) =>
                      index > selected && !played.includes(item.number),
                  );
                  if (nextAfter >= 0) {
                    setSelected(nextAfter);
                  } else {
                    const firstOpen = questions.findIndex(
                      (item) => !played.includes(item.number),
                    );
                    if (firstOpen >= 0) setSelected(firstOpen);
                  }
                  return;
                }
                // Never replace a running question without asking.
                if (question) setReplaceOpen(true);
                else showChosen();
              }}
            >
              {mainAction === "Zeit stoppen" ? (
                <Pause data-icon="inline-start" />
              ) : mainAction === "Lösung aufdecken" ? (
                <Eye data-icon="inline-start" />
              ) : mainAction === "Frage anzeigen" ? (
                <MessageSquare data-icon="inline-start" />
              ) : mainAction === "Zeit starten" ||
                mainAction === "Zeit fortsetzen" ? (
                <Play data-icon="inline-start" />
              ) : (
                <Monitor data-icon="inline-start" />
              )}
              {mainAction}
            </Button>
            {!selectedIsActive && activeIndex >= 0 && (
              <Button variant="outline" onClick={() => setSelected(activeIndex)}>
                Zur laufenden Frage {question?.number}
              </Button>
            )}
            {selectedIsActive &&
              hasSolution &&
              (question?.solutionRevealed ? (
                <Button variant="outline" onClick={() => revealSolution(false)}>
                  <EyeOff data-icon="inline-start" />
                  Lösung verbergen
                </Button>
              ) : (
                mainAction !== "Lösung aufdecken" && (
                  <Button
                    variant="outline"
                    onClick={() => revealSolution(true)}
                  >
                    <Eye data-icon="inline-start" />
                    Lösung aufdecken
                  </Button>
                )
              ))}
            {selectedIsActive && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger
                    render={<Button variant="destructive" size="icon" />}
                    aria-label="Frage abbrechen"
                    onClick={() => setAbortOpen(true)}
                  >
                    <Square />
                  </TooltipTrigger>
                  <TooltipContent>Frage abbrechen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}
      {(error || bankError) && (
        <Alert variant="destructive" className="mt-4">
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
      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Laufende Frage ersetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              {question?.number !== undefined
                ? `Frage ${question.number} ist noch aktiv. `
                : "Eine Frage ist noch aktiv. "}
              Sie wird beendet und auf dem Scoreboard durch Frage{" "}
              {chosen?.number} ersetzt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zurück</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                showChosen();
                setReplaceOpen(false);
              }}
            >
              Frage ersetzen
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
                  const keepIndex = chosen
                    ? next.findIndex((item) => item.number === chosen.number)
                    : -1;
                  setSelected(
                    keepIndex >= 0
                      ? keepIndex
                      : Math.min(selected, Math.max(0, next.length - 1)),
                  );
                  if (question?.number !== undefined) {
                    const updatedActive = next.find(
                      (item) => item.number === question.number,
                    );
                    if (updatedActive) syncActiveQuestion(updatedActive);
                  }
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
                    markiert richtige Antworten. Mehrere sind möglich. Offene
                    Fragen ohne Antworten bekommen ihre Lösung mit ; =Lösung.
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
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{draftError}</AlertDescription>
              </Alert>
            )}
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
