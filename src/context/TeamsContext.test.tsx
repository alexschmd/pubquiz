// @vitest-environment jsdom
import { afterEach, expect, test } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { TeamsProvider, useTeams } from "./TeamsContext";
import { parseTeams, teamRows } from "../lib/teams";
const team = {
  id: 1,
  name: "Bestand",
  score: 12,
  tilt: 0,
  color_start: "#7652df",
};
function Probe() {
  const { teams, updateScore, ready } = useTeams();
  return (
    <>
      <span>{ready ? (teams[0]?.score ?? "leer") : "laden"}</span>
      <button onClick={() => updateScore(1, 1)}>Punkt</button>
    </>
  );
}
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("loads existing teams without overwriting scores and persists changes", async () => {
  localStorage.setItem("teams", JSON.stringify([team]));
  render(
    <TeamsProvider>
      <Probe />
    </TeamsProvider>,
  );
  await screen.findByText("12");
  expect(parseTeams(localStorage.getItem("teams"))[0].score).toBe(12);
  fireEvent.click(screen.getByText("Punkt"));
  expect(parseTeams(localStorage.getItem("teams"))[0].score).toBe(13);
});
test("receives updates and clearing from other tabs", async () => {
  render(
    <TeamsProvider>
      <Probe />
    </TeamsProvider>,
  );
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "teams",
        newValue: JSON.stringify([team]),
      }),
    ),
  );
  await screen.findByText("12");
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: null })));
  await screen.findByText("leer");
});
test("preserves malformed storage instead of overwriting it on mount", async () => {
  localStorage.setItem("teams", "broken");
  render(
    <TeamsProvider>
      <Probe />
    </TeamsProvider>,
  );
  await waitFor(() => expect(screen.getByText("leer")).toBeTruthy());
  expect(localStorage.getItem("teams")).toBe("broken");
});
test("validates team data and retains all teams in one to ten team layouts", () => {
  expect(() => parseTeams(JSON.stringify([team, team]))).toThrow();
  for (let count = 1; count <= 10; count++) {
    const teams = Array.from({ length: count }, (_, id) => ({ ...team, id }));
    expect(teamRows(teams).flat()).toEqual(teams);
  }
});
