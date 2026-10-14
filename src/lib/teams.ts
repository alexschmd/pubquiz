export interface Team {
  id: number;
  name: string;
  score: number;
  tilt: number;
  color_start: string;
}
export const MAX_TEAMS = 10;
export function parseTeams(value: string | null): Team[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.length > MAX_TEAMS)
    throw new Error("Ungültige Teamdaten");
  const ids = new Set<number>();
  return parsed.map((team) => {
    if (
      !team ||
      !Number.isSafeInteger(team.id) ||
      ids.has(team.id) ||
      typeof team.name !== "string" ||
      !Number.isFinite(team.score) ||
      !/^#[0-9a-f]{6}$/i.test(team.color_start)
    )
      throw new Error("Ungültige Teamdaten");
    ids.add(team.id);
    return {
      id: team.id,
      name: team.name,
      score: team.score,
      tilt: Number.isFinite(team.tilt) ? team.tilt : 0,
      color_start: team.color_start,
    };
  });
}
export function createTeam(teams: Team[]): Team {
  const id = Math.max(0, ...teams.map((team) => team.id)) + 1;
  const colors = ["#7652df", "#197eab", "#b84975", "#278770", "#bd742a"];
  return {
    id,
    name: `Team ${id}`,
    score: 0,
    tilt: 0,
    color_start: colors[(id - 1) % colors.length],
  };
}
export function teamRows(teams: Team[]): Team[][] {
  if (teams.length <= 3) return [teams];
  const split = Math.floor(teams.length / 2);
  return [teams.slice(0, split), teams.slice(split)];
}
