import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  QuestionProvider,
  useQuestion,
  useRemainingSeconds,
  QUESTION_KEY,
  parseQuestion,
} from "./QuestionContext";
function Probe() {
  const { question, publish, dismiss, toggleTimer, restartTimer } =
    useQuestion();
  const remaining = useRemainingSeconds(question);
  return (
    <>
      <span>{question?.text ?? "keine Frage"}</span>
      <output>{remaining}</output>
      <button onClick={() => publish("Welche Stadt?", 3)}>Start</button>
      <button onClick={dismiss}>Ende</button>
      <button onClick={toggleTimer}>Pause</button>
      <button onClick={restartTimer}>Neustart</button>
    </>
  );
}
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});
test("publishes an absolute deadline, expires at zero and dismisses", () => {
  vi.useFakeTimers();
  vi.setSystemTime(100000);
  render(
    <QuestionProvider>
      <Probe />
    </QuestionProvider>,
  );
  fireEvent.click(screen.getByText("Start"));
  expect(parseQuestion(localStorage.getItem(QUESTION_KEY))).toEqual({
    text: "Welche Stadt?",
    endsAt: 103000,
    durationMs: 3000,
  });
  expect(screen.getByRole("status").textContent).toBe("3");
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByRole("status").textContent).toBe("0");
  expect(screen.getByText("Welche Stadt?")).toBeTruthy();
  fireEvent.click(screen.getByText("Ende"));
  expect(screen.getByText("keine Frage")).toBeTruthy();
  expect(parseQuestion(localStorage.getItem(QUESTION_KEY))).toBe(null);
});
test("restores remaining time rather than restarting and receives tab changes", () => {
  vi.useFakeTimers();
  vi.setSystemTime(100000);
  localStorage.setItem(
    QUESTION_KEY,
    JSON.stringify({ text: "Bestandsfrage", endsAt: 102000 }),
  );
  render(
    <QuestionProvider>
      <Probe />
    </QuestionProvider>,
  );
  expect(screen.getByRole("status").textContent).toBe("2");
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: QUESTION_KEY,
        newValue: JSON.stringify({ text: "Andere Frage", endsAt: 104000 }),
      }),
    ),
  );
  expect(screen.getByText("Andere Frage")).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("4");
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", { key: QUESTION_KEY, newValue: "null" }),
    ),
  );
  expect(screen.getByText("keine Frage")).toBeTruthy();
});
test("rejects malformed saved questions", () => {
  expect(() => parseQuestion('{"text":"x","endsAt":"invalid"}')).toThrow();
  expect(parseQuestion("null")).toBe(null);
});

test("ticks on the countdown deadline's second boundaries", () => {
  vi.useFakeTimers();
  vi.setSystemTime(100150);
  localStorage.setItem(
    QUESTION_KEY,
    JSON.stringify({ text: "Takt", endsAt: 103500 }),
  );
  render(
    <QuestionProvider>
      <Probe />
    </QuestionProvider>,
  );
  expect(screen.getByRole("status").textContent).toBe("4");
  act(() => vi.advanceTimersByTime(349));
  expect(screen.getByRole("status").textContent).toBe("4");
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("status").textContent).toBe("3");
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("status").textContent).toBe("2");
});

test("stops, restores, resumes and restarts the timer", () => {
  vi.useFakeTimers();
  vi.setSystemTime(100000);
  render(
    <QuestionProvider>
      <Probe />
    </QuestionProvider>,
  );
  fireEvent.click(screen.getByText("Start"));
  act(() => vi.advanceTimersByTime(1250));
  fireEvent.click(screen.getByText("Pause"));
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).pausedRemainingMs,
  ).toBe(1750);
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByRole("status").textContent).toBe("2");
  cleanup();
  render(
    <QuestionProvider>
      <Probe />
    </QuestionProvider>,
  );
  expect(screen.getByRole("status").textContent).toBe("2");
  fireEvent.click(screen.getByText("Pause"));
  act(() => vi.advanceTimersByTime(1750));
  expect(screen.getByRole("status").textContent).toBe("0");
  fireEvent.click(screen.getByText("Neustart"));
  expect(screen.getByRole("status").textContent).toBe("3");
  expect(
    JSON.parse(localStorage.getItem(QUESTION_KEY)!).pausedRemainingMs,
  ).toBeUndefined();
});

test("restores multiple correct answers and migrates the previous single-answer format", () => {
  const base = { text: "Test", endsAt: 1000, options: ["A", "B", "C"] };
  expect(
    parseQuestion(JSON.stringify({ ...base, correctOptions: [0, 2] }))
      ?.correctOptions,
  ).toEqual([0, 2]);
  expect(
    parseQuestion(JSON.stringify({ ...base, correctOption: 1 }))
      ?.correctOptions,
  ).toEqual([1]);
  expect(() =>
    parseQuestion(JSON.stringify({ ...base, correctOptions: [3] })),
  ).toThrow();
});
