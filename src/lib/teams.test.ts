import { expect, test } from "vitest";
import { teamRanks, type Team } from "./teams";
const teams = (scores: number[]): Team[] =>
  scores.map((score, id) => ({
    id,
    name: `Team ${id}`,
    score,
    tilt: 0,
    color_start: "#7652df",
  }));
test("ranks teams by points without changing their order", () => {
  const source = teams([3, 9, 6, -1]);
  expect([...teamRanks(source)]).toEqual([
    [1, 1],
    [2, 2],
    [0, 3],
    [3, 4],
  ]);
  expect(source.map((team) => team.score)).toEqual([3, 9, 6, -1]);
});
test("shares places for ties and skips the corresponding following places", () => {
  expect(
    [...teamRanks(teams([10, 10, 8, 8, 0]))].map(([, rank]) => rank),
  ).toEqual([1, 1, 3, 3, 5]);
  expect([...teamRanks(teams([0, 0, 0]))].map(([, rank]) => rank)).toEqual([
    1, 1, 1,
  ]);
});
