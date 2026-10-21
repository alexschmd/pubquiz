import type { CSSProperties } from "react";

/** The original Once UI gradient geometry: a 400% canvas and a soft radial mask. */
export function TeamBackground({
  color,
  corner = false,
}: {
  color: string;
  corner?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`team-background${corner ? " team-background-corner" : ""}`}
      style={{ "--team-color": color } as CSSProperties}
    >
      <div className="team-gradient" />
    </div>
  );
}
