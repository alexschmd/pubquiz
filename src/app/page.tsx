"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Background,
  Heading,
  Text,
  Column,
  Row,
  RevealFx,
} from "@/once-ui/components";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team3Score, setTeam3Score] = useState(0);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team3Name, setTeam3Name] = useState("");

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

    fetchScores();

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Packe die Teamdaten in ein Array
  const teamsArray = [
    {
      id: "team1",
      name: team1Name,
      score: team1Score,
      tilt: 45,
      colorStart: "brand-background-strong",
    },
    {
      id: "team2",
      name: team2Name,
      score: team2Score,
      tilt: 0,
      colorStart: "brand-background-medium",
    },
    {
      id: "team3",
      name: team3Name,
      score: team3Score,
      tilt: -45,
      colorStart: "accent-background-strong",
    },
  ];

  // Sortiere die Teams absteigend nach Score (höchste Punkte zuerst)
  const sortedTeams = [...teamsArray].sort((a, b) => b.score - a.score);

  // Definiere Schriftgrößen basierend auf dem Rang: 1. = 20rem, 2. = 15rem, 3. = 10rem
  const fontSizes = ["20rem", "15rem", "10rem"];

  return (
    <RevealFx
      speed="medium"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Row style={{ height: "100%", width: "100%" }}>
        {sortedTeams.map((team, index) => (
          // motion.div mit dem Prop "layout" animiert die Positionsänderungen
          <motion.div
            key={team.id}
            layout
            style={{
              width: "33.33%",
              position: "relative",
              padding: "16px",
              overflow: "hidden",
              textAlign: "center",
              transition: "border 0.3s ease-in-out",
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
                tilt: team.tilt,
                opacity: 90,
                colorStart: team.colorStart,
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
            <Heading style={{ zIndex: 2, color: "white" }}>{team.name}</Heading>

            <Text
              style={{
                zIndex: 2,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: fontSizes[index],
                fontWeight: "bold",
                color: "white",
              }}
            >
              {team.score}
            </Text>
          </motion.div>
        ))}
      </Row>
    </RevealFx>
  );
}
