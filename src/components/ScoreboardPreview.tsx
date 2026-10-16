import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScoreboardPreview({ children }: { children?: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scoreboard-preview" ref={frame}>
      {width > 0 && (
        <iframe
          src="/"
          title="Live-Vorschau des Scoreboards"
          tabIndex={-1}
          className="scoreboard-preview-frame"
          style={{ transform: `scale(${width / 1280})` }}
        />
      )}
      {children}
    </div>
  );
}
