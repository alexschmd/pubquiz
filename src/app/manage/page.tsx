"use client";

import React from "react";
import { useTeams } from "@/context/TeamsContext";
import {
  Background,
  Heading,
  Text,
  Button,
  RevealFx,
  Dialog,
  Input,
  ColorInput,
  ToastProvider,
  useToast,
} from "@/once-ui/components";
import { AiOutlineEdit } from "react-icons/ai";

interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
}

function PointsManagementContent() {
  const { teams, updateScore, updateTeamDetails, addTeam, deleteTeam } =
    useTeams();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTeams, setEditingTeams] = React.useState<Team[]>([]);
  const { addToast } = useToast();

  React.useEffect(() => {
    if (isDialogOpen) {
      setEditingTeams(JSON.parse(JSON.stringify(teams))); // Deep copy
    }
  }, [isDialogOpen, teams]);

  const handleInputChange = <K extends keyof Team>(
    teamId: number,
    field: K,
    value: Team[K]
  ) => {
    setEditingTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const newTeamData = { ...t, [field]: value };

          return newTeamData;
        }
        return t;
      })
    );
  };

const handleSaveChanges = () => {
  // Aktualisiere oder ergänze Teams
  editingTeams.forEach((editingTeam) => {
    const originalTeam = teams.find((t) => t.id === editingTeam.id);
    if (originalTeam) {
      // Bestehendes Team aktualisieren, wenn es Änderungen gab
      if (JSON.stringify(originalTeam) !== JSON.stringify(editingTeam)) {
        updateTeamDetails(editingTeam.id, {
          name: editingTeam.name,
          color_start: editingTeam.color_start,
        });
      }
    } else {
      // Neues Team hinzufügen
      updateTeamDetails(editingTeam.id, {
        name: editingTeam.name,
        color_start: editingTeam.color_start,
      });
      addTeam();
    }
  });

  // Entferne Teams, die im Dialog gelöscht wurden
  teams.forEach((originalTeam) => {
    if (!editingTeams.find((et) => et.id === originalTeam.id)) {
      deleteTeam(originalTeam.id);
    }
  });

  setIsDialogOpen(false);
  addToast({
    message: "Die Teams wurden erfolgreich aktualisiert.",
    variant: "success",
  });
};

const handleAddTeam = () => {
  if (editingTeams.length < 10) {
    const newId =
      editingTeams.length > 0
        ? Math.max(...editingTeams.map((t) => t.id)) + 1
        : 1;

    const newTeam: Team = {
      id: newId,
      name: `Team ${newId}`,
      score: 0,
      tilt: 0,
      color_start: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,
    };

    setEditingTeams((prev) => [...prev, newTeam]);
  }
};

const handleDeleteTeam = (teamId: number) => {
  //deleteTeam(teamId);
  setEditingTeams((prev) => prev.filter((t) => t.id !== teamId));
};

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
          colorEnd: "page-background", // Removed item.team.color_end as it's no longer part of the Team interface
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
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="secondary"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 100,
          }}
        >
          <AiOutlineEdit />
        </Button>
        {positionedTiles.map((item) => (
          <TeamTile key={item.team.id} item={item} />
        ))}
      </div>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Teams bearbeiten"
        footer={
          <>
            <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
              Abbrechen
            </Button>
            <Button onClick={handleSaveChanges} variant="primary">
              Speichern
            </Button>
          </>
        }
      >
        <div style={{ padding: "1rem", maxHeight: "70vh", overflowY: "auto" }}>
          {editingTeams
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((team) => (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <Input
                  id={`team-${team.id}-name`}
                  type="text"
                  value={team.name}
                  label="Team Name"
                  onChange={(e) =>
                    handleInputChange(team.id, "name", e.target.value)
                  }
                  style={{ flexGrow: 1, boxSizing: "border-box" }}
                />
                <ColorInput
                  id={`team-${team.id}-color-start`}
                  value={team.color_start}
                  label="Start Farbe"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(team.id, "color_start", e.target.value)
                  }
                  style={{ boxSizing: "border-box", width: "18rem" }}
                />
                <Button
                  onClick={() => handleDeleteTeam(team.id)}
                  variant="danger"
                  prefixIcon="close"
                />
              </div>
            ))}
          {editingTeams.length < 10 && (
            <Button
              onClick={handleAddTeam}
              variant="secondary"
              style={{ marginTop: "1rem", width: "100%" }}
              label="Neues Team hinzufügen"
              prefixIcon="plus"
            />
          )}
        </div>
      </Dialog>
    </RevealFx>
  );
}

export default function PointsManagement() {
  return (
    <ToastProvider>
      <PointsManagementContent />
    </ToastProvider>
  );
}
