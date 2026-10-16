import { afterEach, expect, test } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QuestionComposer } from "./QuestionComposer";
import { QuestionProvider, QUESTION_KEY } from "../context/QuestionContext";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("saves questions in a dialog, selects and times them independently, keeps view controls visible", async () => {
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  expect(
    screen.getByRole("button", { name: "Zur Frage wechseln" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Fragen hinzufügen" }));
  fireEvent.change(await screen.findByLabelText("Fragen"), {
    target: { value: "4. Erste Frage?; (A) (B)\n5. Zweite Frage?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fragen speichern" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBe(null));
  expect(
    JSON.parse(localStorage.getItem("pubquiz-question-bank")!).text,
  ).toContain("Erste Frage");
  fireEvent.change(screen.getByLabelText("Zeit für Frage 4"), {
    target: { value: "30" },
  });
  fireEvent.change(screen.getByLabelText("Frage auswählen"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("Zeit für Frage 5"), {
    target: { value: "90" },
  });

  expect(localStorage.getItem(QUESTION_KEY)).toBe(null);
  fireEvent.click(screen.getByRole("button", { name: "Frage starten" }));
  const published = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(published.number).toBe(5);
  fireEvent.click(
    screen.getByRole("button", { name: "Zum Scoreboard wechseln" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toEqual({
    ...published,
    visible: false,
  });
  fireEvent.click(screen.getByRole("button", { name: "Zur Frage wechseln" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toEqual(published);
  cleanup();
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  expect(
    (screen.getByLabelText("Zeit für Frage 4") as HTMLInputElement).value,
  ).toBe("30");
  expect(
    screen.getByRole("option", { name: "Frage 5: Zweite Frage?" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Frage starten" }));
  const initial = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(initial.revealedOptions).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Antwort A anzeigen" }));
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).revealedOptions,
  ).toEqual([0]);
  fireEvent.click(screen.getByRole("button", { name: "Alle anzeigen" }));
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).revealedOptions,
  ).toEqual([0, 1]);
  fireEvent.click(screen.getByRole("button", { name: "Alle verbergen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toEqual(initial);
});
