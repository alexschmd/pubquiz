import { RevealFx } from "../components/RevealFx";
import { TeamBackground } from "../components/TeamBackground";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LazyMotion, domMax, m, MotionConfig, LayoutGroup } from "motion/react";
import { useTeams } from "../context/TeamsContext";
import { teamRows } from "../lib/teams";
export const Route = createFileRoute("/")({ component: Scoreboard });
function Scoreboard() {
  const { teams, ready, error } = useTeams();
  if (!ready)
    return (
      <main className="empty" aria-busy="true">
        Scoreboard wird geladen …
      </main>
    );
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
            {teams.length === 0 ? (
              <main className="empty scoreboard-empty">
                <TeamBackground color="#4b0082" corner />
                <p className="eyebrow">PUBQUIZ</p>
                <h1>Bereit für die erste Runde?</h1>
                <p>Lege deine Teams an und bring das Scoreboard zum Leben.</p>
                <Link className="button" to="/manage">
                  Teams einrichten
                </Link>
              </main>
            ) : (
              <main className="scoreboard" aria-label="Punktestand">
                {teamRows(
                  [...teams].sort((a, b) => b.score - a.score || a.id - b.id),
                ).map((row, index) => (
                  <div className="score-row" key={index}>
                    {row.map((team) => (
                      <m.article
                        layout
                        layoutId={`team-${team.id}`}
                        transition={{ duration: 0.5 }}
                        className="score-tile"
                        key={team.id}
                      >
                        <TeamBackground color={team.color_start} />
                        <h1>{team.name}</h1>
                        <p className="score">{team.score}</p>
                      </m.article>
                    ))}
                  </div>
                ))}
              </main>
            )}
          </LayoutGroup>
        </RevealFx>
      </MotionConfig>
    </LazyMotion>
  );
}
