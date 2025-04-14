"use client";

import React, { useState, useEffect, SetStateAction } from "react";
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
  // Initialzustände für drei Teams
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team3Score, setTeam3Score] = useState(0);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team3Name, setTeam3Name] = useState("");

  // useEffect zum initialen Laden der Daten und Einrichten des Realtime-Channels
  useEffect(() => {
    async function fetchScores() {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) {
        console.error("Error fetching scores:", error);
      } else if (data) {
        setTeam1Score(data.team1Score);
        setTeam2Score(data.team2Score);
        setTeam3Score(data.team3Score);
        setTeam1Name(data.team1Name);
        setTeam2Name(data.team2Name);
        setTeam3Name(data.team3Name);
      }
    }

    // Hole initiale Daten beim Laden der Seite
    fetchScores();

    // Richte den Realtime Channel ein, um Updates zu empfangen
    const channel = supabase
      .channel("scores-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scores",
          filter: "id=eq.1",
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setTeam1Score(data.team1Score);
            setTeam2Score(data.team2Score);
            setTeam3Score(data.team3Score);
            setTeam1Name(data.team1Name);
            setTeam2Name(data.team2Name);
            setTeam3Name(data.team3Name);
          }
        }
      )
      .subscribe();

    // Cleanup: entferne den Channel beim Unmount der Komponente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Funktion, um die Scores aller Teams zu aktualisieren
  async function updateScores(
    newTeam1Score: number,
    newTeam2Score: number,
    newTeam3Score: number,
    newTeam1Name: SetStateAction<string>,
    newTeam2Name: SetStateAction<string>,
    newTeam3Name: SetStateAction<string>
  ) {
    // Setze lokale States
    setTeam1Score(newTeam1Score);
    setTeam2Score(newTeam2Score);
    setTeam3Score(newTeam3Score);
    setTeam1Name(newTeam1Name);
    setTeam2Name(newTeam2Name);
    setTeam3Name(newTeam3Name);

    const { error } = await supabase
      .from("scores")
      .update({
        team1Score: newTeam1Score,
        team2Score: newTeam2Score,
        team3Score: newTeam3Score,
        team1Name: newTeam1Name,
        team2Name: newTeam2Name,
        team3Name: newTeam3Name,
      })
      .eq("id", 1);
    if (error) console.error("Error updating scores:", error);
  }

  // Funktionen zur Score-Aktualisierung für jedes Team
  const incrementTeam1 = () =>
    updateScores(
      team1Score + 1,
      team2Score,
      team3Score,
      team1Name,
      team2Name,
      team3Name
    );
  const decrementTeam1 = () =>
    updateScores(
      team1Score - 1,
      team2Score,
      team3Score,
      team1Name,
      team2Name,
      team3Name
    );

  const incrementTeam2 = () =>
    updateScores(
      team1Score,
      team2Score + 1,
      team3Score,
      team1Name,
      team2Name,
      team3Name
    );
  const decrementTeam2 = () =>
    updateScores(
      team1Score,
      team2Score - 1,
      team3Score,
      team1Name,
      team2Name,
      team3Name
    );

  const incrementTeam3 = () =>
    updateScores(
      team1Score,
      team2Score,
      team3Score + 1,
      team1Name,
      team2Name,
      team3Name
    );
  const decrementTeam3 = () =>
    updateScores(
      team1Score,
      team2Score,
      team3Score - 1,
      team1Name,
      team2Name,
      team3Name
    );

  return (
    <RevealFx
      speed="fast"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Row style={{ height: "100%", width: "100%" }}>
        {/* Spalte für Team 1 */}
        <Column
          style={{
            width: "33.33%",
            position: "relative",
            padding: "16px",
            overflow: "hidden",
            textAlign: "center",
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
          <Heading style={{ zIndex: "2" }}>
            {team1Name} - {team1Score}
          </Heading>
          <div className="buttonContainer">
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

        {/* Spalte für Team 2 */}
        <Column
          style={{
            width: "33.33%",
            position: "relative",
            padding: "16px",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <Background
            position="absolute"
            mask={{ x: 50, y: 0, radius: 100 }}
            gradient={{
              display: true,
              x: 50,
              y: 60,
              width: 100,
              height: 80,
              tilt: -45,
              opacity: 90,
              colorStart: "brand-background-medium",
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
          <Heading style={{ zIndex: "2" }}>
            {team2Name} - {team2Score}
          </Heading>
          <div className="buttonContainer">
            <Button
              onClick={incrementTeam2}
              variant="secondary"
              size="l"
              prefixIcon="plus"
              style={{
                padding: "10vw",
                backgroundColor: "var(--scheme-blue-500)",
              }}
            />
            <Button
              onClick={decrementTeam2}
              variant="secondary"
              size="l"
              prefixIcon="minus"
              style={{
                padding: "10vw",
                backgroundColor: "var(--scheme-blue-500)",
              }}
            />
          </div>
        </Column>

        {/* Spalte für Team 3 */}
        <Column
          style={{
            width: "33.33%",
            position: "relative",
            padding: "16px",
            overflow: "hidden",
            textAlign: "center",
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
              tilt: 45,
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
          <Heading style={{ zIndex: "2" }}>
            {team3Name} - {team3Score}
          </Heading>
          <div className="buttonContainer">
            <Button
              onClick={incrementTeam3}
              variant="secondary"
              size="l"
              prefixIcon="plus"
              style={{
                padding: "10vw",
                backgroundColor: "var(--scheme-aqua-500)",
              }}
            />
            <Button
              onClick={decrementTeam3}
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

      {/* Eingebettetes CSS für vertikal zentrierte Buttons */}
      <style jsx>{`
        .buttonContainer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </RevealFx>
  );
}
