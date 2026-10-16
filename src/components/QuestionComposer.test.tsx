import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuestionComposer } from "./QuestionComposer";
import { QuestionProvider, QUESTION_KEY } from "../context/QuestionContext";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("publishes nonempty lines in order, stops at the end and can restart", () => {
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  fireEvent.change(screen.getByLabelText("Fragen"), {
    target: { value: " Erste Frage?\r\n\n Zweite Frage? " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Erste Frage starten" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).text).toBe(
    "Erste Frage?",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Nächste Frage starten" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).text).toBe(
    "Zweite Frage?",
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Alle Fragen gestellt",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Von vorne beginnen" }));
  expect(
    (
      screen.getByRole("button", {
        name: "Erste Frage starten",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});
