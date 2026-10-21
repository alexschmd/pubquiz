import type { CSSProperties, ReactNode } from "react";

/** Once UI's mask-and-blur reveal, without its layout or token dependencies. */
export function RevealFx({
  children,
  speed = "medium",
}: {
  children: ReactNode;
  speed?: "fast" | "medium";
}) {
  return (
    <div
      className="reveal-fx"
      style={
        { "--reveal-duration": speed === "fast" ? "1s" : "2s" } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
