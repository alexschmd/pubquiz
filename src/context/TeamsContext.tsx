"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Interface wie gehabt
interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
}

// Beispiel-Definition der Start-Teams; passe Namen, Farben & IDs nach Bedarf an
const DEFAULT_TEAMS: Team[] = [];

type TeamsContextType = {
  teams: Team[];
  updateScore: (teamId: number, delta: number) => void;
  updateTeamDetails: (teamId: number, newDetails: Partial<Team>) => void;
  addTeam: () => void;
  deleteTeam: (teamId: number) => void;
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

  const updateTeamDetails = (teamId: number, newDetails: Partial<Team>) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, ...newDetails } : team
      )
    );
  };

  const addTeam = () => {
    setTeams((prevTeams) => {
      if (prevTeams.length >= 10) {
        // Optional: Zeige eine Meldung oder verhindere das Hinzufügen stillschweigend
        console.warn("Maximale Teamanzahl erreicht.");
        return prevTeams;
      }
      const newId = prevTeams.length > 0 ? Math.max(...prevTeams.map(t => t.id)) + 1 : 1;
      const newTeam: Team = {
        id: newId,
        name: `Team ${newId}`,
        score: 0,
        tilt: 0,
        color_start: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`, // Zufällige Farbe
      };
      return [...prevTeams, newTeam];
    });
  };

  const deleteTeam = (teamId: number) => {
    setTeams((prevTeams) => prevTeams.filter(team => team.id !== teamId));
  };

  return (
    <TeamsContext.Provider value={{ teams, updateScore, updateTeamDetails, addTeam, deleteTeam }}>
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