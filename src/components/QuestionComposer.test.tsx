import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QuestionComposer } from "./QuestionComposer";
import { QuestionProvider, QUESTION_KEY } from "../context/QuestionContext";
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
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
  fireEvent.change(await screen.findByRole("textbox", { name: "Fragen" }), {
    target: { value: "4. Erste Frage?; (A) (B)\n5. Zweite Frage?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fragen speichern" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBe(null));
  expect(
    JSON.parse(localStorage.getItem("pubquiz-question-bank")!).questions[0]
      .text,
  ).toContain("Erste Frage");
  fireEvent.change(screen.getByLabelText("Zeit für Frage 4"), {
    target: { value: "30" },
  });
  expect(
    screen
      .getByRole("button", { name: "Vorherige Frage" })
      .hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Nächste Frage" }));
  expect(screen.getByLabelText("Zeit für Frage 5")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Nächste Frage" })
      .hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Vorherige Frage" }));
  expect(screen.getByLabelText("Zeit für Frage 4")).toBeTruthy();
  expect(localStorage.getItem(QUESTION_KEY)).toBe(null);
  fireEvent.click(
    screen.getByRole("option", { name: "Frage 5: Zweite Frage?" }),
  );
  expect(
    screen
      .getByRole("option", { name: "Frage 5: Zweite Frage?" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  await screen.findByLabelText("Zeit für Frage 5");
  fireEvent.change(screen.getByLabelText("Zeit für Frage 5"), {
    target: { value: "90" },
  });

  expect(localStorage.getItem(QUESTION_KEY)).toBe(null);
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(5);
  // Showing a question alone does not mark it as played.
  expect(
    JSON.parse(localStorage.getItem("pubquiz-question-bank")!).played,
  ).toEqual([]);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Zeit starten" }).at(-1)!,
  );
  const published = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem("pubquiz-question-bank")!).played,
    ).toEqual([5]),
  );
  expect(
    screen.getByRole("option", { name: "Frage 5: Zweite Frage? (gespielt)" }),
  ).toBeTruthy();
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
  expect(screen.getByRole("listbox", { name: "Fragen" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Alle anzeigen" }));
  // Question 5 is still running, so replacing it needs a confirmation.
  fireEvent.click(screen.getByRole("button", { name: "Zur laufenden Frage 5" }));
  expect(screen.getByLabelText("Zeit für Frage 5")).toBeTruthy();
  fireEvent.click(screen.getByRole("option", { name: /Frage 4/ }));
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  const replaceDialog = await screen.findByRole("alertdialog");
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(5);
  fireEvent.click(
    within(replaceDialog).getByRole("button", { name: "Frage ersetzen" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(4);
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).revealedOptions,
  ).toEqual([0, 1]);
  fireEvent.click(screen.getByRole("button", { name: "Alle verbergen" }));
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
  fireEvent.click(
    screen.getByRole("button", { name: "Antwort B als richtig markieren" }),
  );
  const marked = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(marked.correctOptions).toEqual([1]);
  expect(marked.solutionRevealed).toBe(false);
  expect(
    JSON.parse(localStorage.getItem("pubquiz-question-bank")!).questions[0]
      .correctOptions,
  ).toEqual([1]);
  // The solution can be revealed before the timer expires and hidden again.
  expect(
    screen.getAllByRole("button", { name: "Lösung aufdecken" }).length,
  ).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "Lösung aufdecken" }));
  const early = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(early.solutionRevealed).toBe(true);
  expect(early.revealedOptions).toEqual([0, 1]);
  expect(early.pausedRemainingMs).toBe(marked.pausedRemainingMs);
  expect(screen.queryByRole("button", { name: "Lösung aufdecken" })).toBe(null);
  fireEvent.click(screen.getByRole("button", { name: "Lösung verbergen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).solutionRevealed).toBe(
    false,
  );
  expect(screen.queryByRole("button", { name: "Lösung verbergen" })).toBe(null);
  expect(
    screen.getAllByRole("button", { name: "Lösung aufdecken" }).length,
  ).toBe(1);
  fireEvent.click(
    screen.getByRole("button", { name: "Antwort A als richtig markieren" }),
  );
  const expired = {
    ...JSON.parse(localStorage.getItem(QUESTION_KEY)!),
    endsAt: Date.now() - 1000,
  };
  delete expired.pausedRemainingMs;
  localStorage.setItem(QUESTION_KEY, JSON.stringify(expired));
  fireEvent(
    window,
    new StorageEvent("storage", {
      key: QUESTION_KEY,
      newValue: JSON.stringify(expired),
    }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Lösung aufdecken" }),
  );
  const solution = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(solution.solutionRevealed).toBe(true);
  expect(solution.correctOptions).toEqual([0, 1]);
  expect(solution.revealedOptions).toEqual([0, 1]);
  expect(solution.endsAt).toBe(expired.endsAt);
  expect(
    screen.getByRole("button", { name: "Zurück zum Scoreboard" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Lösung verbergen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).solutionRevealed).toBe(
    false,
  );
  expect(
    screen.getAllByRole("button", { name: "Lösung aufdecken" }).length,
  ).toBe(1);
});

test("shows the solution of an open question to the host and reveals and hides it", async () => {
  localStorage.setItem(
    "pubquiz-question-bank",
    JSON.stringify({
      text: "1. Hauptstadt von Frankreich?; =Paris\n2. Ohne Lösung?",
      durations: {},
    }),
  );
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  const hint = await screen.findByText("Paris");
  expect(hint.closest(".question-solution-hint")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  const published = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(published.solution).toBe("Paris");
  expect(published.options).toEqual([]);
  expect(published.solutionRevealed).toBeUndefined();
  fireEvent.click(screen.getByRole("button", { name: "Lösung aufdecken" }));
  const revealed = JSON.parse(localStorage.getItem(QUESTION_KEY)!);
  expect(revealed.solutionRevealed).toBe(true);
  expect(revealed.revealedOptions).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Lösung verbergen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).solutionRevealed).toBe(
    false,
  );
  fireEvent.click(screen.getByRole("button", { name: "Nächste Frage" }));
  expect(document.querySelector(".question-solution-hint")).toBe(null);
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  fireEvent.click(
    within(await screen.findByRole("alertdialog")).getByRole("button", {
      name: "Frage ersetzen",
    }),
  );
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).solution,
  ).toBeUndefined();
  expect(screen.queryByRole("button", { name: "Lösung aufdecken" })).toBe(null);
});

test("copies an import prompt from the questions dialog", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  try {
    render(
      <QuestionProvider>
        <QuestionComposer />
      </QuestionProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Fragen hinzufügen" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Prompt kopieren" }),
    );
    await screen.findByRole("button", { name: "Prompt kopiert" });
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain("keinen Markdown-Codeblock");
    expect(writeText.mock.calls[0][0]).toContain("(Antwort A) (Antwort B)");
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});

test("edits imported questions and multiple correct answers in form fields", async () => {
  localStorage.setItem(
    "pubquiz-question-bank",
    JSON.stringify({ text: "1. Gerade Zahlen?; (2) (3) (4)", durations: {} }),
  );
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Fragen bearbeiten" }));
  fireEvent.click(await screen.findByRole("tab", { name: "Bearbeiten" }));
  fireEvent.change(await screen.findByLabelText("Fragetext"), {
    target: { value: "Welche Zahlen sind gerade?" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Frage 1, Antwort A richtig" }),
  );
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Frage 1, Antwort C richtig" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Fragen speichern" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBe(null));
  const saved = JSON.parse(localStorage.getItem("pubquiz-question-bank")!);
  expect(saved.version).toBe(2);
  expect(saved.questions[0].text).toBe("Welche Zahlen sind gerade?");
  expect(saved.questions[0].correctOptions).toEqual([0, 2]);
  fireEvent.click(screen.getByRole("button", { name: "Fragen bearbeiten" }));
  expect(
    (
      (await screen.findByRole("textbox", {
        name: "Fragen",
      })) as HTMLTextAreaElement
    ).value,
  ).toContain("(2*) (3) (4*)");
});

test("returns to scoreboard after expiry and confirms aborting a running question", async () => {
  localStorage.setItem(
    "pubquiz-question-bank",
    JSON.stringify({
      text: "1. Erste Frage?\n2. Zweite Frage?",
      durations: {},
    }),
  );
  localStorage.setItem(
    QUESTION_KEY,
    JSON.stringify({
      number: 1,
      text: "Erste Frage?",
      options: [],
      endsAt: Date.now() - 1000,
      durationMs: 60000,
      visible: true,
    }),
  );
  render(
    <QuestionProvider>
      <QuestionComposer />
    </QuestionProvider>,
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Zurück zum Scoreboard" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toBe(null);
  // Automatically advances to the next unplayed question.
  expect(screen.getByLabelText("Zeit für Frage 2")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Frage anzeigen" }));
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(2);
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).pausedRemainingMs,
  ).toBe(60000);
  // Updating duration before starting the timer updates the paused active question.
  fireEvent.change(screen.getByLabelText("Zeit für Frage 2"), {
    target: { value: "45" },
  });
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).durationMs).toBe(
    45000,
  );
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).pausedRemainingMs,
  ).toBe(45000);
  // Editing the question bank keeps the selected question and syncs the active question.
  fireEvent.click(screen.getByRole("button", { name: "Fragen bearbeiten" }));
  fireEvent.change(await screen.findByRole("textbox", { name: "Fragen" }), {
    target: { value: "1. Erste Frage?\n2. Zweite Frage (korrigiert)?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fragen speichern" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBe(null));
  expect(screen.getByLabelText("Zeit für Frage 2")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).text).toBe(
    "Zweite Frage (korrigiert)?",
  );
  expect(screen.getAllByRole("button", { name: "Zeit starten" }).length).toBe(
    2,
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Zeit starten" }).at(-1)!,
  );
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).pausedRemainingMs,
  ).toBeUndefined();
  expect(screen.getAllByRole("button", { name: "Zeit stoppen" }).length).toBe(
    2,
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Zeit stoppen" }).at(-1)!,
  );
  expect(
    screen.getAllByRole("button", { name: "Zeit fortsetzen" }).length,
  ).toBe(2);
  expect(screen.queryByRole("button", { name: "Zeit starten" })).toBe(null);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Zeit fortsetzen" }).at(-1)!,
  );
  expect(screen.getAllByRole("button", { name: "Zeit stoppen" }).length).toBe(
    2,
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Frage abbrechen" }).at(-1)!,
  );
  let dialog = await screen.findByRole("alertdialog");
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(2);
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Weiterlaufen lassen" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!).number).toBe(2);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Frage abbrechen" }).at(-1)!,
  );
  dialog = await screen.findByRole("alertdialog");
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Frage abbrechen" }),
  );
  expect(JSON.parse(localStorage.getItem(QUESTION_KEY)!)).toBe(null);
  expect(screen.getByRole("button", { name: "Frage anzeigen" })).toBeTruthy();
});
