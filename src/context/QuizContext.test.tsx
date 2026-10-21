import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuizProvider, useQuiz, QUIZ_STATUS_KEY } from "./QuizContext";
function Controls() {
  const { running, ready, setRunning } = useQuiz();
  return (
    <button disabled={!ready} onClick={() => setRunning(!running)}>
      {running ? "Beenden" : "Starten"}
    </button>
  );
}
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("restores and persists quiz status and synchronizes other tabs", () => {
  localStorage.setItem(QUIZ_STATUS_KEY, "true");
  render(
    <QuizProvider>
      <Controls />
    </QuizProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Beenden" }));
  expect(localStorage.getItem(QUIZ_STATUS_KEY)).toBe("false");
  localStorage.setItem(QUIZ_STATUS_KEY, "true");
  fireEvent(
    window,
    new StorageEvent("storage", { key: QUIZ_STATUS_KEY, newValue: "true" }),
  );
  expect(screen.getByRole("button", { name: "Beenden" })).toBeTruthy();
  localStorage.clear();
  fireEvent(window, new StorageEvent("storage", { key: null }));
  expect(screen.getByRole("button", { name: "Starten" })).toBeTruthy();
});
