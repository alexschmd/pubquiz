"use client";

import React, { useState, useEffect } from "react";
import {
  Background,
  Heading,
  Text,
  Button,
  RevealFx,
} from "@/once-ui/components";
import { supabase } from "@/lib/supabaseClient";

interface Team {
  id: number; // ggf. anpassen (z. B. string)
  name: string;
  score: number;
  tilt: number;
  color_start: string;
  color_end?: string;
}

export default function PointsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);

  // Teams werden aus der DB geladen und anhand der ID (aufsteigend) sortiert.
  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase.from("teams").select("*");
      if (error) {
        console.error("Error fetching teams:", error);
      } else if (data) {
        const sortedTeams = (data as Team[]).sort((a, b) => a.id - b.id);
        setTeams(sortedTeams);
      }
    }
    fetchTeams();

    // Realtime-Updates: Bei Änderungen wird der entsprechende Datensatz ersetzt und danach nach ID sortiert.
    const channel = supabase
      .channel("teams-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams" },
        (payload) => {
          const updatedTeam = payload.new as Team;
          setTeams((prevTeams) =>
            prevTeams
              .map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
              .sort((a, b) => a.id - b.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Funktion zum Aktualisieren des Scores eines Teams
  async function updateTeamScore(teamId: number, newScore: number) {
    setTeams((prevTeams) =>
      prevTeams
        .map((team) =>
          team.id === teamId ? { ...team, score: newScore } : team
        )
        .sort((a, b) => a.id - b.id)
    );
    const { error } = await supabase
      .from("teams")
      .update({ score: newScore })
      .eq("id", teamId);
    if (error) console.error("Error updating team score:", error);
  }

  /*
    Layout-Regeln:
    - 1–3 Teams: Alles in einer Zeile
    - 4 Teams: [2, 2]
    - 5 Teams: [2, 3]
    - 6 Teams: [3, 3]
    - 7 Teams: [3, 4]
    - 8 Teams: [4, 4]
    - 9 Teams: [4, 5] (obere Zeile 4, untere Zeile 5)
    - 10 Teams: [5, 5]
  */
  let layout: number[] = [];
  switch (teams.length) {
    case 1:
      layout = [1];
      break;
    case 2:
      layout = [2];
      break;
    case 3:
      layout = [3];
      break;
    case 4:
      layout = [2, 2];
      break;
    case 5:
      layout = [2, 3];
      break;
    case 6:
      layout = [3, 3];
      break;
    case 7:
      layout = [3, 4];
      break;
    case 8:
      layout = [4, 4];
      break;
    case 9:
      layout = [4, 5];
      break;
    case 10:
      layout = [5, 5];
      break;
    default:
      layout = [teams.length];
      break;
  }

  // Teile das teams‑Array in Zeilen gemäß des Layout‑Arrays
  let rows: Team[][] = [];
  if (layout.length === 1) {
    rows.push(teams);
  } else {
    let start = 0;
    for (const count of layout) {
      rows.push(teams.slice(start, start + count));
      start += count;
    }
  }

  // Berechne für jede Kachel die absolute Position und Größe im Container (100vw x 100vh)
  type PositionedTile = {
    team: Team;
    rowIndex: number;
    colIndex: number;
    tileWidthPercent: number;
    rowHeightPercent: number;
  };

  const positionedTiles: PositionedTile[] = [];
  const totalRows = rows.length;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const columnsInRow = layout[rowIndex];
    const rowHeightPercent = 100 / totalRows; // z. B. bei 2 Zeilen jeweils 50vh
    const tileWidthPercent = 100 / columnsInRow; // Breite der Kachel in dieser Zeile
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      positionedTiles.push({
        team: row[colIndex],
        rowIndex,
        colIndex,
        tileWidthPercent,
        rowHeightPercent,
      });
    }
  }

  // TeamTile-Komponente: Jede Kachel zeigt im Header (oben) den Teamnamen und den Score inline.
  // Darunter folgen vertikal angeordnete, größere Plus-/Minus-Buttons.
  const TeamTile = ({ item }: { item: PositionedTile }) => {
    return (
      <div
        style={{
          position: "absolute",
          left: `${item.colIndex * item.tileWidthPercent}%`,
          top: `${item.rowIndex * item.rowHeightPercent}%`,
          width: `${item.tileWidthPercent}%`,
          height: `${item.rowHeightPercent}%`,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Background
          position="absolute"
          mask={{ x: 50, y: 0, radius: 1000 }}
          gradient={{
            display: true,
            x: 50,
            y: 0, // Gradient startet von oben
            width: 100,
            height: 80,
            opacity: 90,
            colorStart: item.team.color_start,
            colorEnd: item.team.color_end || "page-background",
          }}
          grid={{
            display: false,
            opacity: 100,
            width: "0.25rem",
            color: "neutral-alpha-medium",
            height: "0.25rem",
          }}
          style={{ top: 0, left: 0, width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 3,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          {/* Header: Teamname und inline Score nebeneinander */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Heading
              style={{
                color: "white",
                margin: 0,
                padding: 0,
                fontSize: "2rem",
                zIndex: 2,
              }}
            >
              {item.team.name} - {item.team.score}
            </Heading>
          </div>
          {/* Button-Container: Buttons vertikal (übereinander) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <Button
              onClick={() => updateTeamScore(item.team.id, item.team.score + 1)}
              variant="primary"
              prefixIcon="plus"
              style={{
                padding: "5rem",
                fontSize: "1.8rem",
                backgroundColor: item.team.color_start,
              }}
            />
            <Button
              onClick={() => updateTeamScore(item.team.id, item.team.score - 1)}
              variant="primary"
              prefixIcon="minus"
              style={{
                padding: "5rem",
                fontSize: "1.8rem",
                backgroundColor: item.team.color_start,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <RevealFx
      speed="fast"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100vw", height: "100vh" }}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        {positionedTiles.map((item) => (
          <TeamTile key={item.team.id} item={item} />
        ))}
      </div>
    </RevealFx>
  );
}
