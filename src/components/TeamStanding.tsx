import { Medal, Trophy } from "lucide-react";
export function TeamStanding({ rank }: { rank: number }) {
  return (
    <span className="team-standing" data-place={rank}>
      {rank === 1 ? (
        <Trophy aria-hidden="true" />
      ) : rank <= 3 ? (
        <Medal aria-hidden="true" />
      ) : (
        <span className="standing-marker" aria-hidden="true">
          #
        </span>
      )}
      <span>{rank}. Platz</span>
    </span>
  );
}
