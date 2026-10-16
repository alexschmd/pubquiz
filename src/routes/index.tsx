import { TeamStanding } from "../components/TeamStanding";
import type { ReactNode } from "react";
import { useQuestion } from "../context/QuestionContext";
import { QuestionDisplay } from "../components/QuestionDisplay";
import { SlidingNumber } from "../components/SlidingNumber";
import { RevealFx } from "../components/RevealFx";
import { TeamBackground } from "../components/TeamBackground";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { teamRows, teamRanks } from "../lib/teams";
export const Route = createFileRoute("/")({
  component: Scoreboard,
  head: () => ({ meta: [{ title: "Scoreboard | Pubquiz" }] }),
});
function Scoreboard() {
  const { teams, ready, error } = useTeams();
  const { question, ready: questionReady } = useQuestion();
  const ranks = teamRanks(teams);
  if (!ready || !questionReady)
    return <main className="empty" aria-label="Punktestand" aria-busy="true" />;
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <RevealFx>
          <LayoutGroup>
            {error && (
              <p className="notice" role="alert">
                {error}
              </p>
            )}
            <div className="scoreboard-scenes">
              <AnimatePresence initial={false}>
                <ScoreboardScene
                  key={
                    question && question.visible !== false
                      ? "question"
                      : "leaderboard"
                  }
                >
                  {question && question.visible !== false ? (
                    <QuestionDisplay question={question} />
                  ) : teams.length === 0 ? (
                    <main className="empty scoreboard-empty">
                      <TeamBackground color="#4b0082" corner />
                      <p className="eyebrow">PUBQUIZ</p>
                      <h1>Bereit für die erste Runde?</h1>
                      <p>
                        Lege deine Teams an und bring das Scoreboard zum Leben.
                      </p>
                      <Link className="button" to="/manage">
                        Teams einrichten
                      </Link>
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
                              <p className="score">
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
