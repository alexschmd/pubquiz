import { TeamStanding } from "../components/TeamStanding";
import type { CSSProperties, ReactNode } from "react";
import { useQuestion } from "../context/QuestionContext";
import { QuestionDisplay } from "../components/QuestionDisplay";
import { SlidingNumber } from "../components/SlidingNumber";
import { RevealFx } from "../components/RevealFx";
import { TeamBackground } from "../components/TeamBackground";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../components/ui/empty";
import {
  LazyMotion,
  domMax,
  m,
  MotionConfig,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
  useIsPresent,
} from "motion/react";
import { useTeams } from "../context/TeamsContext";
import { useQuiz } from "../context/QuizContext";
import { teamRows, teamRanks } from "../lib/teams";

function ScoreboardPending() {
  return (
    <main className="scoreboard" aria-label="Punktestand" aria-busy="true" />
  );
}

export const Route = createFileRoute("/quiz")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { preview?: true } => {
    const value = search.preview;
    return value === true || value === "true" || value === 1 || value === "1"
      ? { preview: true }
      : {};
  },
  component: Scoreboard,
  pendingComponent: ScoreboardPending,
  head: () => ({
    meta: [
      { title: "Pubquiz | Scoreboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
function Scoreboard() {
  const { preview } = Route.useSearch();
  const { teams, ready, error } = useTeams();
  const {
    question,
    ready: questionReady,
    error: questionError,
  } = useQuestion();
  const { running, ready: quizReady, error: quizError } = useQuiz();
  const displayError = error || questionError || quizError;
  const ranks = teamRanks(teams);
  if (!ready || !questionReady || !quizReady) return <ScoreboardPending />;
  const showQuestion = !!question && question.visible !== false;
  const scene = showQuestion
    ? "question"
    : teams.length > 0 && !running
      ? "standby"
      : "leaderboard";
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <RevealFx>
          <LayoutGroup>
            {displayError && (
              <Alert
                variant="destructive"
                className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 shadow-lg"
              >
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}
            <div className="scoreboard-scenes">
              <AnimatePresence initial={false}>
                <ScoreboardScene key={scene}>
                  {showQuestion ? (
                    <QuestionDisplay question={question} />
                  ) : teams.length === 0 ? (
                    <main className="scoreboard-empty">
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle role="heading" aria-level={1}>
                            Bereit für die erste Runde?
                          </EmptyTitle>
                          <EmptyDescription>
                            Lege in der Regie deine Teams an. Das Scoreboard
                            erscheint hier automatisch live.
                          </EmptyDescription>
                        </EmptyHeader>
                        {!preview && (
                          <EmptyContent>
                            <Button
                              size="lg"
                              nativeButton={false}
                              render={<Link to="/regie" />}
                            >
                              Regie öffnen
                              <ArrowRight data-icon="inline-end" />
                            </Button>
                          </EmptyContent>
                        )}
                      </Empty>
                    </main>
                  ) : scene === "standby" ? (
                    <main className="scoreboard-empty">
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle role="heading" aria-level={1}>
                            Gleich geht’s los.
                          </EmptyTitle>
                          <EmptyDescription>
                            Das Pubquiz startet jeden Moment.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </main>
                  ) : (
                    <main className="scoreboard" aria-label="Punktestand">
                      {teamRows(
                        [...teams].sort(
                          (a, b) => b.score - a.score || a.id - b.id,
                        ),
                      ).map((row, index) => (
                        <div className="score-row" key={index}>
                          {row.map((team) => (
                            <m.article
                              layout
                              layoutId={`team-${team.id}`}
                              transition={{
                                layout: {
                                  type: "spring",
                                  duration: 0.7,
                                  bounce: 0.25,
                                },
                              }}
                              className="score-tile"
                              data-place={ranks.get(team.id)}
                              key={team.id}
                            >
                              <TeamBackground color={team.color_start} />
                              <h1>{team.name}</h1>
                              <p
                                className="score"
                                style={
                                  {
                                    "--score-digits": Math.max(
                                      2,
                                      String(team.score).length,
                                    ),
                                  } as CSSProperties
                                }
                              >
                                <SlidingNumber value={team.score} />
                              </p>
                              <TeamStanding rank={ranks.get(team.id)!} />
                            </m.article>
                          ))}
                        </div>
                      ))}
                    </main>
                  )}
                </ScoreboardScene>
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </RevealFx>
      </MotionConfig>
    </LazyMotion>
  );
}

function ScoreboardScene({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const present = useIsPresent();
  return (
    <m.div
      className="scoreboard-scene"
      inert={!present}
      aria-hidden={!present || undefined}
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 20,
        scale: reduceMotion ? 1 : 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          duration: reduceMotion ? 0 : 0.55,
          bounce: 0.15,
          opacity: { duration: reduceMotion ? 0 : 0.25 },
        },
      }}
      exit={{
        opacity: 0,
        y: reduceMotion ? 0 : -12,
        scale: reduceMotion ? 1 : 0.98,
        transition: { duration: reduceMotion ? 0 : 0.2 },
      }}
      transition={reduceMotion ? { duration: 0 } : undefined}
    >
      {children}
    </m.div>
  );
}
