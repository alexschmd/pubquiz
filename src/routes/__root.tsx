import { QuizProvider } from "../context/QuizContext";
import { QuestionProvider } from "../context/QuestionContext";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TeamsProvider } from "../context/TeamsContext";
import { Empty, EmptyContent, EmptyHeader } from "../components/ui/empty";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import "../ui.css";
import "../styles.css";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#111111" },
      { title: "Pubquiz" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "de_DE" },
      { property: "og:site_name", content: "Pubquiz" },
      { property: "og:image", content: "https://pubquiz.schmidalex.de/og-image.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Pubquiz: Scoreboard, Fragen und Countdown im Browser.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://pubquiz.schmidalex.de/og-image.png" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
  component: Root,
  notFoundComponent: () => (
    <main className="landing not-found">
      <Empty className="not-found-content">
        <EmptyHeader className="not-found-header">
          <h1>Gute Frage.<br />Falsche Seite.</h1>
        </EmptyHeader>
        <EmptyContent className="not-found-actions">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Zur Startseite
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  ),
});
function Root() {
  return (
    <html lang="de" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <TeamsProvider>
          <QuestionProvider>
            <QuizProvider>
              <Outlet />
            </QuizProvider>
          </QuestionProvider>
        </TeamsProvider>
        <Scripts />
      </body>
    </html>
  );
}
