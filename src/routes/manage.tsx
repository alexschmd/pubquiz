import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Minus,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "../components/ui/empty";
import { useTeams } from "../context/TeamsContext";
import { createTeam, MAX_TEAMS, type Team } from "../lib/teams";
export const Route = createFileRoute("/manage")({ component: Manage });
function Manage() {
  const { teams, ready, error, updateScore, saveTeams } = useTeams();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  function edit() {
    setDraft(teams.map((team) => ({ ...team })));
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
      <div className="management-topbar">
        <Link to="/" className="quiz-wordmark">
          pubquiz<span>/</span>
        </Link>
        <span>Spielleitung</span>
      </div>
      <header className="management-heading">
        <div>
          <h1>Punktestand</h1>
          <p>Teams verwalten und Punkte vergeben.</p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/" target="_blank" rel="noopener" />}
        >
          <span>Scoreboard öffnen</span>
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </header>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <section className="team-sheet" aria-label="Teamverwaltung">
        <div className="sheet-heading">
          <div>
            <h2>Teams</h2>
            <span>{ready ? `${teams.length} von ${MAX_TEAMS}` : "…"}</span>
          </div>
          <Button variant="ghost" disabled={!ready} onClick={edit}>
            <Settings2 data-icon="inline-start" />
            Bearbeiten
          </Button>
        </div>
        {!ready ? (
          <div className="management-loading" aria-busy="true">
            Teams werden geladen …
          </div>
        ) : teams.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <Users className="mx-auto size-6 text-muted-foreground" />
              <EmptyTitle>Noch keine Teams</EmptyTitle>
              <EmptyDescription>
                Lege die Teams für deinen Quizabend an.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={edit}>
                <Plus data-icon="inline-start" />
                Team anlegen
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 pl-6">Nr.</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Punkte</TableHead>
                <TableHead className="w-32 pr-6">
                  <span className="sr-only">Punkte ändern</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...teams]
                .sort((a, b) => a.id - b.id)
                .map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="pl-6 text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="team-identity">
                        <span
                          className="team-swatch"
                          style={{ background: team.color_start }}
                        />
                        <span>{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <output
                        className="team-points"
                        aria-label={`${team.name}: Punkte`}
                      >
                        {team.score}
                      </output>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="point-stepper">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`${team.name}: einen Punkt abziehen`}
                          onClick={() => score(team, -1)}
                        >
                          <Minus />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`${team.name}: einen Punkt hinzufügen`}
                          onClick={() => score(team, 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </section>
      <div className="management-footnote">
        <span>Änderungen werden automatisch gespeichert.</span>
        <span role="status" className="sr-only">
          {message}
        </span>
        <span>Max. 10 Teams</span>
      </div>
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
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
