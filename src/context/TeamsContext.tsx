import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { parseTeams, type Team } from "../lib/teams";
interface TeamsState {
  teams: Team[];
  ready: boolean;
  error: string | null;
  updateScore: (id: number, delta: number) => void;
  saveTeams: (teams: Team[]) => boolean;
  resetScores: () => boolean;
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
  const value = useMemo(() => {
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
      if (draft.some((team) => !team.name.trim())) {
        setError("Bitte für jedes Team einen Namen eingeben.");
        return false;
      }
      // Keep scores changed in another tab while the editor was open.
      const next = draft.map((team) => ({
        ...team,
        name: team.name.trim(),
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
        team.id === id
          ? { ...team, score: Math.max(0, team.score + delta) }
          : team,
      );
      if (persist(next)) setTeams(next);
    }
    function resetScores() {
      if (!ready) return false;
      const next = teams.map((team) => ({ ...team, score: 0 }));
      if (!persist(next)) return false;
      setTeams(next);
      return true;
    }
    return { teams, ready, error, saveTeams, updateScore, resetScores };
  }, [teams, ready, error]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTeams() {
  const state = useContext(Context);
  if (!state) throw new Error("TeamsProvider fehlt");
  return state;
}
