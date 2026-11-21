import { Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Medal,
  Minus,
  Plus,
  Trophy,
} from "lucide-react";
import {
  AnimatePresence,
  LazyMotion,
  LayoutGroup,
  MotionConfig,
  domMax,
  m,
} from "motion/react";
import { SlidingNumber } from "./SlidingNumber";
import { GrainGradient } from "./grain-gradient";
import { Button } from "./ui/button";
import "./LandingDesign.css";

type DemoTeam = {
  id: number;
  name: string;
  score: number;
  color: string;
};

const INITIAL_TEAMS: DemoTeam[] = [
  { id: 1, name: "Die Besserwisser", score: 42, color: "#7652df" },
  { id: 2, name: "Quiz mit Soße", score: 40, color: "#278770" },
  { id: 3, name: "Planlos & durstig", score: 35, color: "#bd742a" },
  { id: 4, name: "Team Feierabend", score: 31, color: "#197eab" },
];

const DEMO_QUESTION = {
  number: 7,
  text: "Wie viele Herzen hat ein Oktopus?",
  options: ["Eins", "Zwei", "Drei", "Vier"],
  correctIndex: 2,
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    num: "01",
    title: "Teams und Fragen vorbereiten",
    body: (
      <>
        Lege bis zu zehn Teams mit eigenen Farben an und füge deine Fragenliste
        per Textimport oder einzeln im Editor hinzu.
      </>
    ),
  },
  {
    num: "02",
    title: "Zweites Fenster auf den Beamer",
    body: (
      <>
        Öffne <code>/quiz</code> im zweiten Fenster und zieh es auf Beamer oder
        Fernseher. Deine Regie unter <code>/regie</code> bleibt auf dem Laptop.
      </>
    ),
  },
  {
    num: "03",
    title: "Moderieren, aufdecken, punkten",
    body: (
      <>
        Starte Fragen samt Countdown, gib Antworten Schritt für Schritt frei und
        vergib Punkte. Die Rangliste sortiert sich sofort live.
      </>
    ),
  },
];

const DETAILS = [
  {
    title: "Klartext statt Klick-Marathon",
    body: (
      <>
        Jede Zeile ist eine Frage, Antworten stehen in Klammern, richtige
        Antworten bekommen ein <code>*</code>. Für vorhandene Word- oder
        PDF-Dokumente ist ein fertiger KI-Prompt direkt eingebaut.
      </>
    ),
  },
  {
    title: "Volle Kontrolle während der Runde",
    body: (
      <>
        Blende Optionen einzeln oder zusammen ein, pausiere den Countdown oder
        starte ihn neu. In <code>/regie</code> siehst du das Beamer-Bild
        jederzeit als 16:9-Vorschau.
      </>
    ),
  },
  {
    title: "Lokal im Browser, sofort bereit",
    body: (
      <>
        Kein Account, kein Server, kein WLAN-Stress für Gäste. Spielstände
        bleiben lokal gespeichert und synchronisieren sich automatisch zwischen
        deinen Tabs.
      </>
    ),
  },
];

export function LandingDesign() {
  const [teams, setTeams] = useState<DemoTeam[]>(INITIAL_TEAMS);
  const [beamerMode, setBeamerMode] = useState<"scoreboard" | "question">(
    "scoreboard",
  );
  const [visibleOptions, setVisibleOptions] = useState<number[]>([0, 1, 2, 3]);
  const [revealed, setRevealed] = useState(false);

  const sorted = [...teams].sort((a, b) => b.score - a.score || a.id - b.id);
  const ranks = new Map<number, number>();
  let currentRank = 0;
  sorted.forEach((team, index) => {
    if (index === 0 || team.score !== sorted[index - 1].score) {
      currentRank = index + 1;
    }
    ranks.set(team.id, currentRank);
  });

  function bump(id: number, delta: number) {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t,
      ),
    );
  }

  function toggleOption(index: number) {
    setVisibleOptions((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index].sort((a, b) => a - b),
    );
  }

  function toggleSolution() {
    setRevealed((prev) => {
      const next = !prev;
      if (next) setVisibleOptions([0, 1, 2, 3]);
      return next;
    });
  }

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <main className="design-buehne">
          <div className="buehne-ambient" aria-hidden="true">
            <GrainGradient
              className="buehne-ambient-canvas"
              colors={["#7652df", "#278770", "#197eab", "#bd742a"]}
              background="#111111"
              speed={0.5}
              loopSeconds={16}
              scale={1.05}
              warp={0.55}
              blur={0.82}
              grain={0.18}
              interaction={{ pointer: 0.85, scroll: 0.3 }}
            />
          </div>

          <header className="buehne-nav">
            <Link to="/" className="quiz-wordmark">
              pubquiz
            </Link>
            <nav className="buehne-nav-links" aria-label="Navigation">
              <a href="#ablauf">Ablauf</a>
              <a href="#funktionen">Funktionen</a>
              <Link to="/regie" className="buehne-nav-cta">
                Regie öffnen
                <ArrowRight size={14} className="buehne-arrow-right" />
              </Link>
            </nav>
          </header>

          <section className="buehne-hero" aria-labelledby="landing-title">
            <div className="buehne-hero-copy">
              <m.h1
                id="landing-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                Du moderierst.
                <br />
                <span>Der Beamer läuft mit.</span>
              </m.h1>

              <m.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
              >
                Fragen vorbereiten, Punkte am Laptop vergeben und das Scoreboard
                im zweiten Fenster groß an die Wand werfen. Direkt im Browser,
                ohne Anmeldung.
              </m.p>

              <m.div
                className="buehne-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
              >
                <Button
                  size="lg"
                  className="buehne-btn"
                  nativeButton={false}
                  render={<Link to="/regie" />}
                >
                  Regie öffnen
                  <ArrowRight
                    data-icon="inline-end"
                    className="buehne-arrow-right"
                  />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="buehne-btn"
                  nativeButton={false}
                  render={<Link to="/quiz" />}
                >
                  Scoreboard öffnen
                  <ArrowUpRight
                    data-icon="inline-end"
                    className="buehne-arrow-diag"
                  />
                </Button>
              </m.div>
            </div>

            <m.div
              className="buehne-stage"
              aria-label="Interaktive Regie- und Beamer-Vorschau"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
            >
              <div className="buehne-pane buehne-pane-regie">
                <div className="buehne-pane-head">
                  <span>Regie (/regie)</span>
                  <div
                    className="buehne-mode-switch"
                    role="tablist"
                    aria-label="Ansicht wechseln"
                  >
                    {(
                      [
                        { id: "scoreboard", label: "Punkte" },
                        { id: "question", label: "Frage" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        data-slot="landing-btn"
                        role="tab"
                        aria-selected={beamerMode === tab.id}
                        className={beamerMode === tab.id ? "is-active" : ""}
                        onClick={() => setBeamerMode(tab.id)}
                      >
                        {beamerMode === tab.id && (
                          <m.span
                            layoutId="buehne-mode-pill"
                            className="buehne-mode-pill"
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                            }}
                          />
                        )}
                        <span className="buehne-mode-label">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {beamerMode === "scoreboard" ? (
                    <m.div
                      key="regie-scoreboard"
                      className="buehne-regie-teams"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <div className="buehne-regie-grid">
                        {teams.map((team) => (
                          <div
                            key={team.id}
                            className="buehne-regie-tile"
                            style={{ "--t-color": team.color } as CSSProperties}
                          >
                            <span className="buehne-team-name">{team.name}</span>
                            <div className="buehne-tile-score">
                              <strong className="buehne-team-score">
                                <SlidingNumber value={team.score} />
                              </strong>
                              <span>Punkte</span>
                            </div>
                            <div className="buehne-steppers">
                              <button
                                type="button"
                                data-slot="landing-btn"
                                aria-label={`Punkt abziehen für ${team.name}`}
                                onClick={() => bump(team.id, -1)}
                              >
                                <Minus size={13} />
                              </button>
                              <button
                                type="button"
                                data-slot="landing-btn"
                                aria-label={`Punkt hinzufügen für ${team.name}`}
                                onClick={() => bump(team.id, 1)}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="buehne-hint">
                        Probier’s aus: Punkte hier ändern direkt die Platzierung
                        rechts.
                      </p>
                    </m.div>
                  ) : (
                    <m.div
                      key="regie-question"
                      className="buehne-regie-question"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <div className="buehne-q-meta">
                        Frage {DEMO_QUESTION.number} · 30 Sek.
                      </div>
                      <p className="buehne-q-title">{DEMO_QUESTION.text}</p>
                      <div className="buehne-q-options">
                        {DEMO_QUESTION.options.map((opt, idx) => {
                          const shown = visibleOptions.includes(idx);
                          const isCorrect = idx === DEMO_QUESTION.correctIndex;
                          const letter = "ABCD"[idx];
                          return (
                            <div key={letter} className="buehne-q-opt-row">
                              <button
                                type="button"
                                data-slot="landing-btn"
                                className={`buehne-q-eye ${shown ? "is-shown" : ""}`}
                                aria-pressed={shown}
                                aria-label={`Antwort ${letter} ${shown ? "verbergen" : "anzeigen"}`}
                                onClick={() => toggleOption(idx)}
                              >
                                {shown ? (
                                  <Eye size={13} />
                                ) : (
                                  <EyeOff size={13} />
                                )}
                              </button>
                              <span className="buehne-q-letter">{letter}</span>
                              <span className="buehne-q-opt-text">{opt}</span>
                              {isCorrect && (
                                <span
                                  className="buehne-q-correct"
                                  title="Richtige Antwort"
                                >
                                  <Check size={13} />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="buehne-q-controls">
                        <Button
                          type="button"
                          variant={revealed ? "outline" : "default"}
                          className="w-full"
                          onClick={toggleSolution}
                        >
                          {revealed ? (
                            <EyeOff data-icon="inline-start" />
                          ) : (
                            <Eye data-icon="inline-start" />
                          )}
                          {revealed ? "Lösung verbergen" : "Lösung aufdecken"}
                        </Button>
                      </div>
                      <p className="buehne-hint">
                        Blende Antworten einzeln ein oder decke die Lösung für
                        den Beamer auf.
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="buehne-pane buehne-pane-beamer">
                <div className="buehne-pane-head">
                  <span className="buehne-live-badge">Scoreboard (/quiz)</span>
                  <span className="buehne-pane-meta">Beamer-Ansicht</span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {beamerMode === "scoreboard" ? (
                    <m.div
                      key="beamer-scoreboard"
                      className="buehne-beamer-scene"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LayoutGroup>
                        <div className="buehne-beamer-grid">
                          {sorted.map((team) => {
                            const rank = ranks.get(team.id) ?? 1;
                            return (
                              <m.div
                                key={team.id}
                                layout
                                transition={{
                                  layout: {
                                    type: "spring",
                                    duration: 0.6,
                                    bounce: 0.2,
                                  },
                                }}
                                className="buehne-beamer-tile"
                                data-place={rank}
                                style={
                                  { "--t-color": team.color } as CSSProperties
                                }
                              >
                                <span className="buehne-beamer-name">
                                  {team.name}
                                </span>
                                <strong className="buehne-beamer-score">
                                  <SlidingNumber value={team.score} />
                                </strong>
                                <span
                                  className="buehne-beamer-rank"
                                  data-place={rank}
                                >
                                  {rank === 1 ? (
                                    <Trophy size={11} />
                                  ) : rank <= 3 ? (
                                    <Medal size={11} />
                                  ) : (
                                    <span className="buehne-rank-hash">#</span>
                                  )}
                                  {rank}. Platz
                                </span>
                              </m.div>
                            );
                          })}
                        </div>
                      </LayoutGroup>
                    </m.div>
                  ) : (
                    <m.div
                      key="beamer-question"
                      className={`buehne-beamer-question ${visibleOptions.length > 0 ? "has-options" : ""}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="buehne-beamer-q-label">
                        Frage {DEMO_QUESTION.number}
                      </span>
                      <h3>{DEMO_QUESTION.text}</h3>
                      {visibleOptions.length > 0 && (
                        <div className="buehne-beamer-options">
                          {DEMO_QUESTION.options.map((opt, idx) => {
                            if (!visibleOptions.includes(idx)) return null;
                            const isCorrect =
                              revealed && idx === DEMO_QUESTION.correctIndex;
                            const isDimmed =
                              revealed && idx !== DEMO_QUESTION.correctIndex;
                            return (
                              <div
                                key={opt}
                                className={`buehne-beamer-opt ${isCorrect ? "is-correct" : ""} ${isDimmed ? "is-dimmed" : ""}`}
                              >
                                <span>{"ABCD"[idx]}</span>
                                {opt}
                                {isCorrect && (
                                  <span className="buehne-opt-check">
                                    <Check size={13} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="buehne-beamer-timer-wrap">
                        <div className="buehne-beamer-timer">0:30</div>
                        <span className="buehne-beamer-timer-label">
                          Verbleibende Zeit
                        </span>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </m.div>
          </section>

          <section className="buehne-steps" id="ablauf">
            <m.div
              className="buehne-split"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="buehne-split-head">
                <h2>So läuft der Abend.</h2>
                <p>
                  Zwei Fenster im selben Browser, mehr braucht es nicht für
                  einen runden Quizabend.
                </p>
              </div>
              <ol className="buehne-step-list">
                {STEPS.map((step) => (
                  <li key={step.num}>
                    <span className="buehne-step-num">{step.num}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </m.div>
          </section>

          <section
            className="buehne-features"
            id="funktionen"
            aria-labelledby="features-title"
          >
            <m.div
              className="buehne-features-layout"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="buehne-import-showcase">
                <div className="buehne-import-bar">
                  <span>Textimport</span>
                  <span>3 Fragen erkannt</span>
                </div>
                <div className="buehne-import-body" aria-hidden="true">
                  <p>
                    <span className="tok-num">1.</span> Wie viele Herzen hat ein
                    Oktopus?<span className="tok-sep">;</span>{" "}
                    <span className="tok-opt">(Eins)</span>{" "}
                    <span className="tok-opt">(Zwei)</span>{" "}
                    <span className="tok-correct">(Drei*)</span>{" "}
                    <span className="tok-opt">(Vier)</span>
                  </p>
                  <p>
                    <span className="tok-num">2.</span> Welcher Planet ist der
                    Sonne am nächsten?<span className="tok-sep">;</span>{" "}
                    <span className="tok-correct">(Merkur*)</span>{" "}
                    <span className="tok-opt">(Venus)</span>{" "}
                    <span className="tok-opt">(Mars)</span>
                  </p>
                  <p>
                    <span className="tok-num">3.</span> In welchem Jahr fiel die
                    Berliner Mauer?
                  </p>
                </div>
              </div>

              <div className="buehne-details">
                <h2 id="features-title">Für echte Quizabende gebaut.</h2>
                <div className="buehne-detail-list">
                  {DETAILS.map((detail) => (
                    <article key={detail.title}>
                      <h3>{detail.title}</h3>
                      <p>{detail.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </m.div>
          </section>

          <section className="buehne-closing">
            <div>
              <h2>Direkt loslegen.</h2>
              <p>Kostenlos, lokal im Browser und ohne Anmeldung.</p>
            </div>
            <div className="buehne-closing-actions">
              <Button
                size="lg"
                className="buehne-btn"
                nativeButton={false}
                render={<Link to="/regie" />}
              >
                Regie öffnen
                <ArrowRight
                  data-icon="inline-end"
                  className="buehne-arrow-right"
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="buehne-btn"
                nativeButton={false}
                render={<Link to="/quiz" />}
              >
                Scoreboard öffnen
                <ArrowUpRight
                  data-icon="inline-end"
                  className="buehne-arrow-diag"
                />
              </Button>
            </div>
          </section>

          <footer className="buehne-footer">
            <Link to="/" className="quiz-wordmark">
              pubquiz
            </Link>
            <a
              href="https://schmidalex.de"
              target="_blank"
              rel="noopener noreferrer"
              className="buehne-footer-cta"
            >
              schmidalex.de
              <ArrowUpRight size={14} className="buehne-arrow-diag" />
            </a>
          </footer>
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}
