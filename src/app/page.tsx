"use client";

import React from "react";
import {
  Background,
  Heading,
  Text,
  Column,
  Row,
  RevealFx,
} from "@/once-ui/components";

export default function Home() {
  const team1Score = 75;
  const team2Score = 65;

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
            overflow: "hidden", // Verhindert, dass der Background aus der Spalte herausragt
          }}
        >
          <Background
            position="absolute"
            mask={{
              x: 0,
              y: 0,
              radius: 100,
            }}
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
              fontSize: "20rem", // Sehr große Schriftgröße
              fontWeight: "bold", // Fetter Text
              color: "white", // Weiß für gute Lesbarkeit
            }}
          >
            {team1Score}
          </Text>
        </Column>

        {/* Rechte Spalte mit individuellem Background für Team 2 */}
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
            mask={{
              x: 100,
              y: 0,
              radius: 100,
            }}
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

          {/* Punktzahl in der Mitte */}
          <Text
            style={{
              zIndex: "2",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "20rem", // Sehr große Schriftgröße
              fontWeight: "bold", // Fetter Text
              color: "white", // Weiß für gute Lesbarkeit
            }}
          >
            {team2Score}
          </Text>
        </Column>
      </Row>
    </RevealFx>
  );
}
