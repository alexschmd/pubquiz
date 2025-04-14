"use client";

import React from "react";
import {
  Background,
  Heading,
  Text,
  Column,
  Row,
  Button,
  RevealFx,
} from "@/once-ui/components";
import { size } from "@floating-ui/react-dom";

export default function PointsManagement() {
  const [team1Score, setTeam1Score] = React.useState(75);
  const [team2Score, setTeam2Score] = React.useState(65);

  const incrementTeam1 = () => setTeam1Score((prev) => prev + 1);
  const decrementTeam1 = () => setTeam1Score((prev) => prev - 1);
  const incrementTeam2 = () => setTeam2Score((prev) => prev + 1);
  const decrementTeam2 = () => setTeam2Score((prev) => prev - 1);

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
          {/* Teamname und Punktzahl */}
          <div style={{ zIndex: 2 }}>
            <Heading>Team 1 - {team1Score}</Heading>
          </div>
          {/* Zwei riesige Buttons, mittig in der Spalte positioniert */}
          <div
            style={{
              position: "absolute",
              top: "50%",
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
          {/* Teamname und Punktzahl */}
          <div style={{ zIndex: 2 }}>
            <Heading>{team2Score} - Team 2</Heading>
          </div>
          {/* Zwei riesige Buttons, mittig in der Spalte positioniert */}
          <div
            style={{
              position: "absolute",
              top: "50%",
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
