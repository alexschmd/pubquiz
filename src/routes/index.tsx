import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Settings2 } from "lucide-react";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [{ title: "Pubquiz" }] }),
});
function Landing() {
  const { running, ready } = useQuiz();
  if (!ready) return <main className="landing" aria-busy="true" />;
  if (running) return <Navigate to="/quiz" replace />;
  return (
    <main className="landing">
      <header>
        <Link to="/" className="quiz-wordmark">
          pubquiz<span>/</span>
        </Link>
      </header>
      <section className="landing-intro">
        <p className="eyebrow">DER NÄCHSTE QUIZABEND</p>
        <h1>
          Gute Fragen.
          <br />
          Große Diskussionen.
        </h1>
        <p>
          Bereite deine Fragen vor, stell die Teams zusammen und bring die
          Punkte auf den Bildschirm.
        </p>
        <div className="landing-actions">
          <Button nativeButton={false} render={<Link to="/manage" />}>
            <Settings2 data-icon="inline-start" />
            Quiz vorbereiten
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/quiz" />}
          >
            Zum Scoreboard
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </main>
  );
}
