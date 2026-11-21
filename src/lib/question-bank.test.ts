import { afterEach, expect, test } from "vitest";
import {
  BANK_KEY,
  clearPlayedQuestions,
  playedQuestionCount,
} from "./question-bank";

afterEach(() => localStorage.clear());

test("counts and clears played questions while keeping the bank", () => {
  expect(playedQuestionCount()).toBe(0);
  expect(clearPlayedQuestions()).toBe(true);
  expect(localStorage.getItem(BANK_KEY)).toBe(null);
  const bank = {
    version: 2,
    questions: [{ number: 1, text: "A?", options: [] }],
    durations: { 1: "30" },
    played: [1],
  };
  localStorage.setItem(BANK_KEY, JSON.stringify(bank));
  expect(playedQuestionCount()).toBe(1);
  expect(clearPlayedQuestions()).toBe(true);
  expect(JSON.parse(localStorage.getItem(BANK_KEY)!)).toEqual({
    ...bank,
    played: [],
  });
  expect(playedQuestionCount()).toBe(0);
});
