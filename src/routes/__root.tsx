import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TeamsProvider } from "../context/TeamsContext";
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
    <main className="empty">
      <h1>Seite nicht gefunden</h1>
      <Link to="/">Zum Scoreboard</Link>
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
          <Outlet />
        </TeamsProvider>
        <Scripts />
      </body>
    </html>
  );
}
