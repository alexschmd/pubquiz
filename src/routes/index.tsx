import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuiz } from "../context/QuizContext";
import { LandingDesign } from "../components/LandingDesign";

type LandingSearch = { landing?: true };

const SITE_TITLE = "Pubquiz App";
const SITE_DESCRIPTION =
  "Teams anlegen, Fragen vorbereiten und Punktestand, Antworten und Countdown auf dem Beamer zeigen. Läuft einfach im Browser, ohne Anmeldung.";

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
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:url", content: "https://pubquiz.schmidalex.de/" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
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
          description: SITE_DESCRIPTION,
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
