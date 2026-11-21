import { expect, test } from "vitest";
import {
  parseQuestionList,
  serializeQuestions,
  validateQuestions,
} from "./questions";
test("parses optional numbering and answer options while skipping blank lines", () => {
  expect(
    parseQuestionList(" 7. Hauptstadt?; (Berlin) (Bonn)\r\n\nOffene Frage?"),
  ).toEqual([
    { number: 7, text: "Hauptstadt?", options: ["Berlin", "Bonn"] },
    { number: 2, text: "Offene Frage?", options: [] },
  ]);
});
test("rejects duplicate numbers and malformed answer syntax", () => {
  for (const text of ["1. A\n1. B", "A; Antwort", "A; ()", "A; (offen"])
    expect(() => parseQuestionList(text)).toThrow();
});

test("extracts the correct-answer marker without displaying it", () => {
  expect(parseQuestionList("1. Planet?; (Merkur*) (Venus)")[0]).toEqual({
    number: 1,
    text: "Planet?",
    options: ["Merkur", "Venus"],
    correctOptions: [0],
  });
  expect(
    parseQuestionList("1. Planet?; (Merkur*) (Venus*)")[0].correctOptions,
  ).toEqual([0, 1]);
});

test("parses an optional solution for open questions", () => {
  expect(
    parseQuestionList("2. Wer schrieb Faust?;  = Johann Wolfgang von Goethe "),
  ).toEqual([
    {
      number: 2,
      text: "Wer schrieb Faust?",
      options: [],
      solution: "Johann Wolfgang von Goethe",
    },
  ]);
  expect(parseQuestionList("1. Formel?; =a = b (c)")[0].solution).toBe(
    "a = b (c)",
  );
});

test("rejects empty or overlong open-question solutions", () => {
  for (const text of ["1. A; =", "1. A; =   ", `1. A; =${"x".repeat(301)}`])
    expect(() => parseQuestionList(text)).toThrow(/Lösung/);
  expect(() => parseQuestionList(`1. A; =${"x".repeat(300)}`)).not.toThrow();
});

test("validates open-question solutions", () => {
  expect(
    validateQuestions([
      { number: 1, text: " Faust? ", options: [], solution: " Goethe " },
      { number: 2, text: "Leer?", options: [], solution: "   " },
      { number: 3, text: "Wahl?", options: ["A", "B"], solution: "A" },
    ]),
  ).toEqual([
    { number: 1, text: "Faust?", options: [], solution: "Goethe" },
    { number: 2, text: "Leer?", options: [] },
    { number: 3, text: "Wahl?", options: ["A", "B"] },
  ]);
  for (const solution of [42, null, "x".repeat(301)])
    expect(() =>
      validateQuestions([{ number: 1, text: "A", options: [], solution }]),
    ).toThrow();
});

test("serializes open-question solutions and round-trips them", () => {
  const questions = [
    {
      number: 1,
      text: "Planet?",
      options: ["Merkur", "Venus"],
      correctOptions: [0],
    },
    { number: 2, text: "Wer schrieb Faust?", options: [], solution: "Goethe" },
    { number: 3, text: "Offen?", options: [] },
  ];
  const text = serializeQuestions(questions);
  expect(text).toBe(
    "1. Planet?; (Merkur*) (Venus)\n2. Wer schrieb Faust?; =Goethe\n3. Offen?",
  );
  expect(parseQuestionList(text)).toEqual(questions);
  expect(() =>
    serializeQuestions([
      { number: 1, text: "A", options: [], solution: "Zeile\nZwei" },
    ]),
  ).toThrow(/Sonderzeichen/);
});
