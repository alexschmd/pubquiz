import { useQuiz } from "../context/QuizContext";
import { useQuestion } from "../context/QuestionContext";
import { QuestionComposer } from "./QuestionComposer";
import { Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Minus, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "./ui/empty";
import { useTeams } from "../context/TeamsContext";
import { createTeam, MAX_TEAMS, type Team } from "../lib/teams";
import { Skeleton } from "./ui/skeleton";
import { TeamTilesSkeleton } from "./LoadingSkeletons";
import {
  clearPlayedQuestions,
  playedQuestionCount,
} from "../lib/question-bank";

function tileStyle(color: string): CSSProperties {
  const ink = "#f0f0f0";
  const surface = `color-mix(in srgb, ${color} 16%, #111111)`;
  return {
    "--team-color": color,
    "--background": surface,
    "--foreground": ink,
    "--muted": `color-mix(in srgb, ${color} 24%, #111111)`,
    "--border": `color-mix(in srgb, ${color} 32%, #303030)`,
    "--ring": ink,
  } as CSSProperties;
}

export function ManageView() {
  const { running, ready: quizReady, error: quizError, setRunning } = useQuiz();
  const { question, dismiss } = useQuestion();
  const { teams, ready, error, updateScore, saveTeams, resetScores } =
    useTeams();
  const [open, setOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);
  // Remounts the question controls so they reload the reset question bank.
  const [composerKey, setComposerKey] = useState(0);
  const hasScores = teams.some((team) => team.score > 0);
  function start() {
    const count = playedQuestionCount();
    if (hasScores || count > 0) {
      setPlayedCount(count);
      setStartOpen(true);
    } else setRunning(true);
  }
  function startNewEvening() {
    if (!resetScores() || !clearPlayedQuestions()) return;
    if (question) dismiss();
    setComposerKey((key) => key + 1);
    setRunning(true);
    setStartOpen(false);
  }
  const [draft, setDraft] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  function edit() {
    setDraft(
      teams.length > 0
        ? teams.map((team) => ({ ...team }))
        : [createTeam([])],
    );
    setOpen(true);
  }
  function change(id: number, patch: Partial<Team>) {
    setDraft((current) =>
      current.map((team) => (team.id === id ? { ...team, ...patch } : team)),
    );
  }
  function score(team: Team, delta: number) {
    updateScore(team.id, delta);
    setMessage(
      `${team.name}: ${delta > 0 ? "Punkt hinzugefügt" : "Punkt abgezogen"}.`,
    );
  }
  return (
    <main className="management">
      <header className="management-topbar">
        <div className="management-breadcrumb">
          <Link to="/" search={{ landing: true }} className="quiz-wordmark">
            pubquiz<span>/</span>
          </Link>
          <h1 className="management-title">regie</h1>
        </div>
        <div className="management-actions">
          <Button
            variant={running ? "outline" : "default"}
            disabled={!quizReady}
            onClick={() => {
              if (running) setEndOpen(true);
              else start();
            }}
          >
            {running ? "Quiz beenden" : "Quiz starten"}
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/quiz" target="_blank" rel="noopener" />}
          >
            <ArrowUpRight data-icon="inline-start" />
            Scoreboard öffnen
          </Button>
        </div>
      </header>
      {(error || quizError) && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error || quizError}</AlertDescription>
        </Alert>
      )}
      <div className="management-columns">
        <QuestionComposer key={composerKey} />
        <section className="team-sheet" aria-label="Teamverwaltung">
          <div className="sheet-heading">
            <div className="section-title">
              <h2>Teams</h2>
              <span className="section-count">
                {ready ? (
                  `${teams.length} von ${MAX_TEAMS}`
                ) : (
                  <Skeleton className="inline-block h-3.5 w-12 align-middle" />
                )}
              </span>
            </div>
            {ready && teams.length > 0 && (
              <Button variant="ghost" onClick={edit}>
                <Pencil data-icon="inline-start" />
                Teams bearbeiten
              </Button>
            )}
          </div>
          {!ready ? (
            <TeamTilesSkeleton />
          ) : teams.length === 0 ? (
            <Empty className="question-empty">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Noch keine Teams</EmptyTitle>
                <EmptyDescription>
                  Lege die Teams für deinen Quizabend an.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={edit}>
                  <Plus data-icon="inline-start" />
                  Team hinzufügen
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="management-tiles">
              {[...teams]
                .sort((a, b) => a.id - b.id)
                .map((team) => (
                  <article
                    className="management-tile"
                    key={team.id}
                    style={tileStyle(team.color_start)}
                  >
                    <div className="team-identity">
                      <h3>{team.name}</h3>
                    </div>
                    <div className="tile-score">
                      <output aria-label={`${team.name}: Punkte`}>
                        {team.score}
                      </output>
                      <span>Punkte</span>
                    </div>
                    <div className="tile-controls">
                      <Button
                        variant="outline"
                        disabled={team.score <= 0}
                        aria-label={`${team.name}: einen Punkt abziehen`}
                        onClick={() => score(team, -1)}
                      >
                        <Minus />
                      </Button>
                      <Button
                        variant="outline"
                        aria-label={`${team.name}: einen Punkt hinzufügen`}
                        onClick={() => score(team, 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>
      <span role="status" className="sr-only">
        {message}
      </span>
      <AlertDialog open={startOpen} onOpenChange={setStartOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quiz fortsetzen oder neu starten?</AlertDialogTitle>
            <AlertDialogDescription>
              {[
                hasScores ? "Die Teams haben noch Punkte" : null,
                playedCount > 0
                  ? `${playedCount} ${playedCount === 1 ? "Frage ist" : "Fragen sind"} als gespielt markiert`
                  : null,
              ]
                .filter(Boolean)
                .join(" und ")}
              . Ein neuer Quizabend setzt Punkte und Spielfortschritt zurück.
              Teams, Fragen und Zeiten bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRunning(true);
                setStartOpen(false);
              }}
            >
              Fortsetzen
            </AlertDialogCancel>
            <AlertDialogAction onClick={startNewEvening}>
              Neuen Quizabend starten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={endOpen} onOpenChange={setEndOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quiz beenden?</AlertDialogTitle>
            <AlertDialogDescription>
              {question
                ? "Die laufende Frage wird ebenfalls beendet. Auf dem Scoreboard erscheint wieder der Wartebildschirm, Teams und Fragen bleiben erhalten."
                : "Auf dem Scoreboard erscheint wieder der Wartebildschirm. Teams und Fragen bleiben erhalten."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiterspielen</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (setRunning(false)) dismiss();
                setEndOpen(false);
              }}
            >
              Quiz beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <form
            id="team-editor"
            onSubmit={(event) => {
              event.preventDefault();
              if (saveTeams(draft)) {
                setOpen(false);
                setMessage("Teams gespeichert.");
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Teams bearbeiten</DialogTitle>
              <DialogDescription>
                Namen und Farben ändern oder Teams hinzufügen.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-6 max-h-[50dvh] overflow-y-auto pr-1">
              {draft.map((team) => (
                <div key={team.id} className="team-editor-row">
                  <Field>
                    <FieldLabel htmlFor={`name-${team.id}`}>
                      Teamname
                    </FieldLabel>
                    <Input
                      id={`name-${team.id}`}
                      required
                      maxLength={60}
                      value={team.name}
                      onChange={(event) =>
                        change(team.id, { name: event.target.value })
                      }
                    />
                  </Field>
                  <Field className="w-12 shrink-0">
                    <FieldLabel htmlFor={`color-${team.id}`}>Farbe</FieldLabel>
                    <Input
                      id={`color-${team.id}`}
                      type="color"
                      value={team.color_start}
                      onChange={(event) =>
                        change(team.id, { color_start: event.target.value })
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${team.name} löschen`}
                    onClick={() =>
                      setDraft((current) =>
                        current.filter((item) => item.id !== team.id),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </FieldGroup>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={draft.length >= MAX_TEAMS}
              onClick={() =>
                setDraft((current) => [
                  ...current,
                  createTeam([...teams, ...current]),
                ])
              }
            >
              <Plus data-icon="inline-start" />
              Team hinzufügen
              <span className="text-muted-foreground">
                {draft.length}/{MAX_TEAMS}
              </span>
            </Button>
          </form>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" form="team-editor">
              Teams speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
