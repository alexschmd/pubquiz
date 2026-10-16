import { expect, test } from "vitest";
import { parseQuestionList } from "./questions";
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
