"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Interface wie gehabt
interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
  color_end?: string;
}

// Beispiel-Definition der Start-Teams; passe Namen, Farben & IDs nach Bedarf an
const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: "Team A", score: 0, tilt: 0, color_start: "#ff0000", color_end: "#ffa0a0" },
  { id: 2, name: "Team B", score: 0, tilt: 0, color_start: "#00ff00", color_end: "#a0ffa0" },
  { id: 3, name: "Team C", score: 0, tilt: 0, color_start: "#0000ff", color_end: "#a0a0ff" },
];

type TeamsContextType = {
  teams: Team[];
  updateScore: (teamId: number, delta: number) => void;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);

  // 1) Initial aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("teams");
    if (stored) {
      setTeams(JSON.parse(stored));
    } else {
      setTeams(DEFAULT_TEAMS);
      localStorage.setItem("teams", JSON.stringify(DEFAULT_TEAMS));
    }
  }, []);

  // 2) Immer wenn sich teams ändern, in localStorage schreiben
  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  // 3) Sync across browser tabs/windows when localStorage is updated elsewhere
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "teams" && e.newValue) {
        setTeams(JSON.parse(e.newValue) as Team[]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // 3) Funktion, mit der jede Page den Score ändern kann
  const updateScore = (teamId: number, delta: number) => {
    setTeams((prev) =>
      prev
        .map((t) =>
          t.id === teamId
            ? { ...t, score: t.score + delta }
            : t
        )
        .sort((a, b) => b.score - a.score)
    );
  };

  return (
    <TeamsContext.Provider value={{ teams, updateScore }}>
      {children}
    </TeamsContext.Provider>
  );
}

// Hook zum einfachen Zugriff
export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be inside TeamsProvider");
  return ctx;
}