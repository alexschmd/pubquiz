import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuestionComposer } from "./QuestionComposer";
import { QuestionProvider, QUESTION_KEY } from "../context/QuestionContext";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("selects questions without publishing, remembers durations and switches views without restarting", () => {
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  fireEvent.change(screen.getByLabelText("Fragen"), {
    target: { value: "4. Erste Frage?; (A) (B)\n\n5. Zweite Frage?" },
  });
  fireEvent.change(screen.getByLabelText("Dauer in Sekunden"), {
    target: { value: "30" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Nächste Frage auswählen" }),
  );
  expect(localStorage.getItem(QUESTION_KEY)).toBe(null);
  expect(
    (screen.getByLabelText("Dauer in Sekunden") as HTMLInputElement).value,
  ).toBe("60");
  fireEvent.change(screen.getByLabelText("Dauer in Sekunden"), {
    target: { value: "90" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Frage starten" }));
  const published = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(published.text).toBe("Zweite Frage?");
  expect(published.number).toBe(5);
  fireEvent.click(screen.getByRole("button", { name: "Scoreboard anzeigen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toEqual({
    ...published,
    visible: false,
  });
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toEqual(published);
  fireEvent.change(screen.getByLabelText("Frage auswählen"), {
    target: { value: "0" },
  });
  expect(
    (screen.getByLabelText("Dauer in Sekunden") as HTMLInputElement).value,
  ).toBe("30");
  fireEvent.click(screen.getByRole("button", { name: "Frage starten" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).options).toEqual([
    "A",
    "B",
  ]);
});
