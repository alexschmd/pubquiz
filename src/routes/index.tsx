import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuiz } from "../context/QuizContext";
import { LandingDesign } from "../components/LandingDesign";

type LandingSearch = { landing?: true };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): LandingSearch =>
    search.landing === true ||
    search.landing === "true" ||
    search.landing === 1 ||
    search.landing === "1"
      ? { landing: true }
      : {},
  component: Landing,
  head: () => ({
    meta: [
      {
        title:
          "Pubquiz – Kostenloses Live-Scoreboard & Regie für deinen Quizabend",
      },
      {
        name: "description",
        content:
          "Bereite Fragen vor, verwalte Teams am Laptop und zeige Live-Scoreboard, Antworten und Countdown direkt auf dem Beamer – kostenlos im Browser, ohne Anmeldung.",
      },
      { property: "og:url", content: "https://pubquiz.schmidalex.de/" },
      {
        property: "og:title",
        content:
          "Pubquiz – Kostenloses Live-Scoreboard & Regie für deinen Quizabend",
      },
      {
        property: "og:description",
        content:
          "Bereite Fragen vor, verwalte Teams am Laptop und zeige Live-Scoreboard, Antworten und Countdown direkt auf dem Beamer – kostenlos im Browser, ohne Anmeldung.",
      },
      {
        name: "twitter:title",
        content:
          "Pubquiz – Kostenloses Live-Scoreboard & Regie für deinen Quizabend",
      },
      {
        name: "twitter:description",
        content:
          "Bereite Fragen vor, verwalte Teams am Laptop und zeige Live-Scoreboard, Antworten und Countdown direkt auf dem Beamer – kostenlos im Browser, ohne Anmeldung.",
      },
    ],
    links: [{ rel: "canonical", href: "https://pubquiz.schmidalex.de/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Pubquiz",
          url: "https://pubquiz.schmidalex.de/",
          description:
            "Kostenloses Live-Scoreboard, Fragenverwaltung und Countdown für deinen Pubquiz-Abend mit getrennter Regie- und Beamer-Ansicht direkt im Browser.",
          inLanguage: "de",
          applicationCategory: "GameApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript",
          image: "https://pubquiz.schmidalex.de/og-image.png",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
        }),
      },
    ],
  }),
});
function Landing() {
  const { running, ready } = useQuiz();
  const { landing } = Route.useSearch();
  if (ready && running && !landing) return <Navigate to="/quiz" replace />;
  return <LandingDesign />;
}
