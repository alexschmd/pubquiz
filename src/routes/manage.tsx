import { TeamBackground } from "../components/TeamBackground";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTeams } from "../context/TeamsContext";
import { createTeam, MAX_TEAMS, type Team } from "../lib/teams";
export const Route = createFileRoute("/manage")({ component: Manage });
function Manage() {
  const { teams, ready, error, updateScore, saveTeams } = useTeams();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  function edit() {
    setDraft(teams.map((team) => ({ ...team })));
    dialog.current?.showModal();
  }
  function change(id: number, patch: Partial<Team>) {
    setDraft((current) =>
      current.map((team) => (team.id === id ? { ...team, ...patch } : team)),
    );
  }
  return (
    <main className={`manage${ready ? " reveal-fx reveal-fast" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">PUBQUIZ · SPIELLEITUNG</p>
          <h1>Alles im Blick.</h1>
        </div>
        <nav>
          <Link
            className="button secondary"
            to="/"
            target="_blank"
            rel="noopener"
          >
            Scoreboard öffnen ↗
          </Link>
          <button disabled={!ready} onClick={edit}>
            Teams bearbeiten
          </button>
        </nav>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <p role="status" className="status">
        {message}
      </p>
      {!ready ? (
        <p>Teams werden geladen …</p>
      ) : teams.length === 0 ? (
        <section className="empty">
          <h2>Dein Quiz beginnt mit den Teams.</h2>
          <p>
            Bis zu zehn Teams, individuelle Farben und ein gemeinsamer
            Punktestand.
          </p>
          <button onClick={edit}>Erstes Team anlegen</button>
        </section>
      ) : (
        <section className="manage-grid" aria-label="Teams">
          {[...teams]
            .sort((a, b) => a.id - b.id)
            .map((team) => (
              <article
                className="team-card"
                key={team.id}
                style={{ borderTopColor: team.color_start }}
              >
                <TeamBackground color={team.color_start} />
                <h2>{team.name}</h2>
                <p className="manage-score">
                  {team.score}
                  <span>Punkte</span>
                </p>
                <div className="score-controls">
                  <button
                    className="secondary"
                    aria-label={`${team.name}: einen Punkt abziehen`}
                    onClick={() => updateScore(team.id, -1)}
                  >
                    −
                  </button>
                  <button
                    aria-label={`${team.name}: einen Punkt hinzufügen`}
                    onClick={() => updateScore(team.id, 1)}
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
        </section>
      )}
      <dialog ref={dialog} aria-labelledby="editor-title">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (saveTeams(draft)) {
              dialog.current?.close();
              setMessage("Teams aktualisiert.");
            }
          }}
        >
          <h2 id="editor-title">Teams bearbeiten</h2>
          <p className="muted">Namen und Farben für deinen Quizabend.</p>
          <div className="editor-list">
            {draft.map((team) => (
              <div className="editor-row" key={team.id}>
                <label>
                  Teamname
                  <input
                    required
                    maxLength={60}
                    value={team.name}
                    onChange={(event) =>
                      change(team.id, { name: event.target.value })
                    }
                  />
                </label>
                <label>
                  Farbe
                  <input
                    type="color"
                    value={team.color_start}
                    onChange={(event) =>
                      change(team.id, { color_start: event.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="secondary delete"
                  aria-label={`${team.name} löschen`}
                  onClick={() =>
                    setDraft((current) =>
                      current.filter((item) => item.id !== team.id),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="secondary add-team"
            disabled={draft.length >= MAX_TEAMS}
            onClick={() =>
              setDraft((current) => [
                ...current,
                createTeam([...teams, ...current]),
              ])
            }
          >
            + Team hinzufügen ({draft.length}/{MAX_TEAMS})
          </button>
          <footer>
            <button
              type="button"
              className="secondary"
              onClick={() => dialog.current?.close()}
            >
              Abbrechen
            </button>
            <button type="submit">Speichern</button>
          </footer>
        </form>
      </dialog>
    </main>
  );
}
