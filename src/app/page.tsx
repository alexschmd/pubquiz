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

export default function LandingPage() {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

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
      }
    }

    // Hole initiale Daten beim Laden der Seite
    fetchScores();

    // Richten den Realtime Channel ein, um später Updates zu empfangen
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <RevealFx
      speed="medium"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Row style={{ height: "100%", width: "100%" }}>
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
          <Heading style={{ zIndex: "2" }}>Team 1</Heading>
          <Text
            style={{
              zIndex: "2",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "20rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {team1Score}
          </Text>
        </Column>
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
          <Heading style={{ zIndex: "2" }}>Team 2</Heading>
          <Text
            style={{
              zIndex: "2",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "20rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {team2Score}
          </Text>
        </Column>
      </Row>
    </RevealFx>
  );
}
