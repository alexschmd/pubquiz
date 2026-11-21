import { useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreparedQuestion } from "../lib/questions";
import { Button } from "./ui/button";

const ROW_HEIGHT = 36;
const VISIBLE_ROWS = 4;
const LIST_PADDING = 4;

/**
 * A four-row question list with up/down buttons beside it. The list scrolls
 * along so the selected question always sits in the second row: one row of
 * context above, the next two questions below.
 */
export function QuestionMiniList({
  id,
  questions,
  selected,
  onSelect,
  played,
}: {
  id?: string;
  questions: PreparedQuestion[];
  selected: number;
  onSelect: (index: number) => void;
  /** Question numbers that have already been started. */
  played: ReadonlySet<number>;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Own eased scroll: Safari's native smooth scroll is short and jumpy. A new
  // target restarts from the current position, so rapid steps stay fluid.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const target = Math.min(
      Math.max(0, (selected - 1) * ROW_HEIGHT),
      list.scrollHeight - list.clientHeight,
    );
    const start = list.scrollTop;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;
    if (
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      list.scrollTop = target;
      return;
    }
    const duration = Math.min(450, 260 + Math.abs(distance) * 0.15);
    const begin = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - begin) / duration);
      list.scrollTop = start + distance * (1 - Math.pow(1 - t, 4));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  function move(delta: number) {
    const next = selected + delta;
    if (next >= 0 && next < questions.length) onSelect(next);
  }

  return (
    <div className="flex items-stretch gap-1.5">
      <div
        ref={listRef}
        id={id}
        role="listbox"
        aria-label="Fragen"
        aria-activedescendant={`question-option-${selected}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
          }
        }}
        className="min-w-0 flex-1 overflow-y-auto rounded-lg border border-input outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        style={{
          height: VISIBLE_ROWS * ROW_HEIGHT + LIST_PADDING * 2 + 2,
          padding: LIST_PADDING,
        }}
      >
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 rounded-md bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              height: ROW_HEIGHT,
              transform: `translateY(${selected * ROW_HEIGHT}px)`,
            }}
          />
          {questions.map((item, index) => {
            const isPlayed = played.has(item.number);
            const isSelected = index === selected;
            return (
              <div
                key={item.number}
                id={`question-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-label={`Frage ${item.number}: ${item.text}${isPlayed ? " (gespielt)" : ""}`}
                onClick={() => onSelect(index)}
                style={{ height: ROW_HEIGHT }}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 text-sm transition-colors duration-300",
                  !isSelected && "hover:bg-accent/40",
                  isSelected && "text-accent-foreground",
                  isPlayed && !isSelected && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-md bg-muted px-1.5 font-mono text-xs text-muted-foreground tabular-nums",
                    isPlayed && "bg-transparent text-muted-foreground/60",
                  )}
                >
                  {String(item.number).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.text}</span>
                {isPlayed && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Check className="size-3" />
                    gespielt
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="flex-1"
          aria-label="Vorherige Frage"
          title="Vorherige Frage"
          disabled={selected === 0}
          onClick={() => move(-1)}
        >
          <ChevronUp />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="flex-1"
          aria-label="Nächste Frage"
          title="Nächste Frage"
          disabled={selected >= questions.length - 1}
          onClick={() => move(1)}
        >
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
}
