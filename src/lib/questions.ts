export interface PreparedQuestion {
  number: number;
  text: string;
  options: string[];
  correctOption?: number;
}
export function parseQuestionList(source: string): PreparedQuestion[] {
  const used = new Set<number>();
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const numbered = line.match(/^(\d+)[.)]\s*(.*)$/);
      const number = numbered ? Number(numbered[1]) : index + 1;
      const content = numbered ? numbered[2] : line;
      const separator = content.indexOf(";");
      const text = (
        separator < 0 ? content : content.slice(0, separator)
      ).trim();
      const answers = separator < 0 ? "" : content.slice(separator + 1).trim();
      const options = [...answers.matchAll(/\(([^()]*)\)/g)].map((match) =>
        match[1].trim(),
      );
      const marked = options
        .map((option, index) => (option.endsWith("*") ? index : -1))
        .filter((index) => index >= 0);
      if (marked.length > 1)
        throw new Error(
          `Frage ${number}: Nur eine Antwort als richtig markieren.`,
        );
      const correctOption = marked[0];
      if (correctOption !== undefined)
        options[correctOption] = options[correctOption].slice(0, -1).trim();
      if (!Number.isSafeInteger(number) || number < 1 || used.has(number))
        throw new Error(
          `Frage ${index + 1}: Bitte eindeutige positive Nummern verwenden.`,
        );
      used.add(number);
      if (!text || text.length > 1000)
        throw new Error(
          `Frage ${number}: Der Fragetext muss 1 bis 1000 Zeichen enthalten.`,
        );
      if (
        answers &&
        (answers.replace(/\([^()]*\)/g, "").trim() ||
          options.some((option) => !option || option.length > 300) ||
          options.length > 8)
      )
        throw new Error(
          `Frage ${number}: Antworten als (Antwort A) (Antwort B) angeben, höchstens acht Antworten mit je 300 Zeichen.`,
        );
      return {
        number,
        text,
        options,
        ...(correctOption !== undefined ? { correctOption } : {}),
      };
    });
}
