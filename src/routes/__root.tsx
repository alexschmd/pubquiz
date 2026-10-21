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
import { ArrowLeft } from "lucide-react";
import { Empty, EmptyContent, EmptyHeader } from "../components/ui/empty";
import "../ui.css";
import "../styles.css";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pubquiz" },
    ],
  }),
  component: Root,
  notFoundComponent: () => (
    <main className="landing not-found">
      <header>
        <Link to="/" className="quiz-wordmark">
          pubquiz<span>/</span>
        </Link>
      </header>
      <Empty className="not-found-content">
        <EmptyHeader className="not-found-header">
          <p className="not-found-code">404</p>
          <h1>Gute Frage.<br />Falsche Seite.</h1>
        </EmptyHeader>
        <EmptyContent className="not-found-actions">
          <Link to="/" className="not-found-back">
            <ArrowLeft aria-hidden="true" />
            Zur Startseite
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  ),
});
function Root() {
  return (
    <html lang="de">
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
