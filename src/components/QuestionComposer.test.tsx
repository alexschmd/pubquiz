import { afterEach, expect, test, vi } from "vitest";
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
  fireEvent.click(screen.getByRole("combobox"));
  const option = await screen.findByRole("option", {
    name: "Frage 5: Zweite Frage?",
  });
  fireEvent.mouseMove(option);
  fireEvent.mouseDown(option);
  fireEvent.mouseUp(option);
  fireEvent.click(option);
  await screen.findByLabelText("Zeit für Frage 5");
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
  expect(screen.getByRole("combobox")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Alle anzeigen" }));
  fireEvent.click(screen.getByRole("button", { name: "Frage starten" }));
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
