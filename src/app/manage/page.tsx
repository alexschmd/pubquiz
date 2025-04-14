"use client";

import React, { useState, useEffect } from "react";
import {
  Background,
  Heading,
  Column,
  Row,
  Button,
  RevealFx,
} from "@/once-ui/components";
import { supabase } from "@/lib/supabaseClient";

export default function PointsManagement() {
  // Lokaler State, der initial mit den Werten aus der Datenbank befüllt werden könnte
  const [team1Score, setTeam1Score] = useState(75);
  const [team2Score, setTeam2Score] = useState(65);

  // Optional: Lese initiale Werte aus Supabase (falls noch nicht vorhanden, setze Standardwerte)
  useEffect(() => {
    async function fetchScores() {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("id", "1")
        .single();
      if (data) {
        setTeam1Score(data.team1Score);
        setTeam2Score(data.team2Score);
      } else if (error) {
        console.error("Error fetching scores:", error);
      }
    }
    fetchScores();
  }, []);

  // Funktion, um Scores zu aktualisieren
  async function updateScores(newTeam1Score: any, newTeam2Score: any) {
    setTeam1Score(newTeam1Score);
    setTeam2Score(newTeam2Score);

    const { error } = await supabase
      .from("scores")
      .update({ team1Score: newTeam1Score, team2Score: newTeam2Score })
      .eq("id", 1);
    if (error) console.error("Error updating scores:", error);
  }

  const incrementTeam1 = () => updateScores(team1Score + 1, team2Score);
  const decrementTeam1 = () => updateScores(team1Score - 1, team2Score);
  const incrementTeam2 = () => updateScores(team1Score, team2Score + 1);
  const decrementTeam2 = () => updateScores(team1Score, team2Score - 1);

  return (
    <RevealFx
      speed="fast"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Row style={{ height: "100%", width: "100%" }}>
        {/* Linke Spalte für Team 1 */}
        <Column
          style={{
            width: "50%",
            position: "relative",
            padding: "16px",
            overflow: "hidden",
          }}
        >
          <Background
            position="absolute"
            mask={{ x: 0, y: 0, radius: 100 }}
            gradient={{
              display: true,
              x: 0,
              y: 60,
              width: 100,
              height: 80,
              tilt: 45,
              opacity: 90,
              colorStart: "brand-background-strong",
              colorEnd: "page-background",
            }}
            grid={{
              display: false,
              opacity: 100,
              width: "2rem",
              color: "neutral-alpha-medium",
              height: "2rem",
            }}
          />
          <Heading style={{ zIndex: "2" }}>Team 1 - {team1Score}</Heading>
          <div
            style={{
              position: "absolute",
              top: "70%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: "1rem",
            }}
          >
            <Button
              onClick={incrementTeam1}
              variant="primary"
              size="l"
              prefixIcon="plus"
              style={{ padding: "10vw" }}
            />
            <Button
              onClick={decrementTeam1}
              variant="primary"
              size="l"
              prefixIcon="minus"
              style={{ padding: "10vw" }}
            />
          </div>
        </Column>

        {/* Rechte Spalte für Team 2 */}
        <Column
          style={{
            width: "50%",
            position: "relative",
            padding: "16px",
            overflow: "hidden",
            textAlign: "right",
          }}
        >
          <Background
            position="absolute"
            mask={{ x: 100, y: 0, radius: 100 }}
            gradient={{
              display: true,
              x: 100,
              y: 60,
              width: 100,
              height: 80,
              tilt: -45,
              opacity: 90,
              colorStart: "accent-background-strong",
              colorEnd: "page-background",
            }}
            grid={{
              display: false,
              opacity: 100,
              width: "0.25rem",
              color: "neutral-alpha-medium",
              height: "0.25rem",
            }}
          />
          <Heading style={{ zIndex: "2" }}>{team2Score} - Team 2</Heading>
          <div
            style={{
              position: "absolute",
              top: "70%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: "1rem",
            }}
          >
            <Button
              onClick={incrementTeam2}
              variant="secondary"
              size="l"
              prefixIcon="plus"
              style={{
                padding: "10vw",
                backgroundColor: "var(--scheme-aqua-500)",
              }}
            />
            <Button
              onClick={decrementTeam2}
              variant="secondary"
              size="l"
              prefixIcon="minus"
              style={{
                padding: "10vw",
                backgroundColor: "var(--scheme-aqua-500)",
              }}
            />
          </div>
        </Column>
      </Row>
    </RevealFx>
  );
}
