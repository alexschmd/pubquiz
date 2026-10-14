import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { parseTeams, type Team } from "../lib/teams";
interface TeamsState {
  teams: Team[];
  ready: boolean;
  error: string | null;
  updateScore: (id: number, delta: number) => void;
  saveTeams: (teams: Team[]) => boolean;
}
const Context = createContext<TeamsState | null>(null);
export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      setTeams(parseTeams(localStorage.getItem("teams")));
    } catch {
      setError(
        "Gespeicherte Teams konnten nicht geladen werden. Die vorhandenen Daten wurden nicht überschrieben.",
      );
    }
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key !== "teams" && event.key !== null) return;
      try {
        setTeams(parseTeams(event.newValue));
        setError(null);
      } catch {
        setError(
          "Teamdaten aus einem anderen Tab konnten nicht geladen werden.",
        );
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function persist(next: Team[]) {
    try {
      localStorage.setItem("teams", JSON.stringify(next));
      setError(null);
    } catch {
      setError(
        "Änderungen konnten nicht gespeichert werden. Bitte Browserspeicher prüfen.",
      );
      return false;
    }
    return true;
  }
  function saveTeams(draft: Team[]) {
    if (!ready) return false;
    // Keep scores changed in another tab while the editor was open.
    const next = draft.map((team) => ({
      ...team,
      score:
        teams.find((current) => current.id === team.id)?.score ?? team.score,
    }));
    if (!persist(next)) return false;
    setTeams(next);
    return true;
  }
  function updateScore(id: number, delta: number) {
    if (!ready) return;
    const next = teams.map((team) =>
      team.id === id ? { ...team, score: team.score + delta } : team,
    );
    if (persist(next)) setTeams(next);
  }
  return (
    <Context.Provider value={{ teams, ready, error, saveTeams, updateScore }}>
      {children}
    </Context.Provider>
  );
}
export function useTeams() {
  const state = useContext(Context);
  if (!state) throw new Error("TeamsProvider fehlt");
  return state;
}
