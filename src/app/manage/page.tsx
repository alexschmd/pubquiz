"use client";

import React from "react";
import { useTeams } from "@/context/TeamsContext";
import { Background, Heading, Text, Button, RevealFx } from "@/once-ui/components";

interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
  color_end?: string;
}

export default function PointsManagement() {
  const { teams, updateScore } = useTeams();

  // Sort by ID for display
  const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

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

  const TeamTile = ({ item }: { item: PositionedTile }) => (
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <Button
            onClick={() => updateScore(item.team.id, +1)}
            variant="primary"
            prefixIcon="plus"
            style={{
              padding: "5rem",
              fontSize: "1.8rem",
              backgroundColor: item.team.color_start,
            }}
          />
          <Button
            onClick={() => updateScore(item.team.id, -1)}
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

  return (
    <RevealFx
      speed="fast"
      delay={0}
      translateY={0}
      trigger={false}
      style={{ width: "100vw", height: "100vh" }}
    >
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        {positionedTiles.map((item) => (
          <TeamTile key={item.team.id} item={item} />
        ))}
      </div>
    </RevealFx>
  );
}
