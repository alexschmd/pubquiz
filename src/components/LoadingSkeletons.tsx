import { Skeleton } from "./ui/skeleton";

export function QuestionControlsSkeleton() {
  return (
    <div
      className="question-compact-selection"
      aria-busy="true"
      aria-label="Fragen werden geladen"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-24" />
        <div className="flex items-stretch gap-1.5">
          <Skeleton className="h-[154px] flex-1 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="w-8 flex-1 rounded-lg" />
            <Skeleton className="w-8 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function TeamTilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="management-tiles"
      aria-busy="true"
      aria-label="Teams werden geladen"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="management-tile" key={index} aria-hidden="true">
          <div className="team-identity">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="tile-score">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="mt-1 h-3 w-11" />
          </div>
          <div className="tile-controls">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ManageSkeleton() {
  return (
    <main
      className="management"
      aria-busy="true"
      aria-label="Regie wird geladen"
    >
      <header className="management-topbar">
        <div className="management-breadcrumb">
          <span className="quiz-wordmark">
            pubquiz<span>/</span>
          </span>
          <span className="management-title">regie</span>
        </div>
        <div className="management-actions">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </header>
      <div className="management-columns">
        <section className="question-composer" aria-hidden="true">
          <section className="question-session">
            <div className="question-list-heading">
              <div className="section-title">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="scoreboard-preview">
              <Skeleton className="size-full rounded-none bg-muted/35" />
            </div>
          </section>
          <div className="question-list-heading">
            <div className="section-title">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3.5 w-6" />
            </div>
          </div>
          <QuestionControlsSkeleton />
          <div className="question-control-bar">
            <div className="question-start-controls">
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        </section>
        <section className="team-sheet" aria-hidden="true">
          <div className="sheet-heading">
            <div className="section-title">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3.5 w-12" />
            </div>
          </div>
          <TeamTilesSkeleton />
        </section>
      </div>
    </main>
  );
}
