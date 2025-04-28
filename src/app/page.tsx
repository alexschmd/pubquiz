"use client";

import React from "react";
import { useTeams } from "@/context/TeamsContext";
import { Background, Heading, Text, RevealFx } from "@/once-ui/components";
import { motion, LayoutGroup } from "framer-motion";

interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
  color_end?: string;
}

export default function LandingPage() {
  const { teams } = useTeams();
  const sortTeams = (teamsArray: Team[]) =>
    [...teamsArray].sort((a, b) => b.score - a.score);

  const sortedTeams = sortTeams(teams);

  let layout: number[] = [];
  switch (sortedTeams.length) {
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
      layout = [sortedTeams.length];
      break;
  }

  let rows: Team[][] = [];
  if (layout.length === 1) {
    rows.push(sortedTeams);
  } else {
    let start = 0;
    for (const count of layout) {
      rows.push(sortedTeams.slice(start, start + count));
      start += count;
    }
  }

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
    const rowHeightPercent = 100 / totalRows;
    const tileWidthPercent = 100 / columnsInRow;
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

  const TeamTile = ({ item }: { item: PositionedTile }) => {
    return (
      <motion.div
        layout
        layoutId={`team-${item.team.id}`}
        transition={{ layout: { duration: 0.5, type: "tween" } }}
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
            y: 0,
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
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              padding: "0.5rem",
              textAlign: "center",
            }}
          >
            <Heading style={{ color: "white", margin: 0, padding: 0 }}>
              {item.team.name}
            </Heading>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Text
              style={{
                fontSize: "17rem",
                fontWeight: "bold",
                color: "white",
                margin: 0,
                padding: 0,
              }}
            >
              {item.team.score}
            </Text>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <RevealFx
      speed="medium"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100vw", height: "100vh" }}
    >
      <LayoutGroup>
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          {positionedTiles.map((item) => (
            <TeamTile key={item.team.id} item={item} />
          ))}
        </div>
      </LayoutGroup>
    </RevealFx>
  );
}
