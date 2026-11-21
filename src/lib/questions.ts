export interface PreparedQuestion {
  number: number;
  text: string;
  options: string[];
  correctOptions?: number[];
  solution?: string;
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
      if (!Number.isSafeInteger(number) || number < 1 || used.has(number))
        throw new Error(
          `Frage ${index + 1}: Bitte eindeutige positive Nummern verwenden.`,
        );
      used.add(number);
      if (!text || text.length > 1000)
        throw new Error(
          `Frage ${number}: Der Fragetext muss 1 bis 1000 Zeichen enthalten.`,
        );
      if (answers.startsWith("=")) {
        const solution = answers.slice(1).trim();
        if (solution.length < 1 || solution.length > 300)
          throw new Error(
            `Frage ${number}: Die Lösung nach „; =“ muss 1 bis 300 Zeichen enthalten.`,
          );
        return { number, text, options: [], solution };
      }
      const options = [...answers.matchAll(/\(([^()]*)\)/g)].map((match) =>
        match[1].trim(),
      );
      const marked = options
        .map((option, index) => (option.endsWith("*") ? index : -1))
        .filter((index) => index >= 0);
      for (const index of marked)
        options[index] = options[index].slice(0, -1).trim();
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
        ...(marked.length ? { correctOptions: marked } : {}),
      };
    });
}

export function validateQuestions(value: unknown): PreparedQuestion[] {
  if (!Array.isArray(value)) throw new Error("Ungültige Fragenliste.");
  const used = new Set<number>();
  return value.map((item) => {
    if (
      !item ||
      !Number.isSafeInteger(item.number) ||
      item.number < 1 ||
      used.has(item.number) ||
      typeof item.text !== "string" ||
      !item.text.trim() ||
      item.text.length > 1000 ||
      !Array.isArray(item.options) ||
      item.options.length > 8 ||
      item.options.some(
        (option: unknown) =>
          typeof option !== "string" || !option.trim() || option.length > 300,
      ) ||
      (item.correctOptions !== undefined &&
        (!Array.isArray(item.correctOptions) ||
          item.correctOptions.some(
            (index: unknown) =>
              !Number.isInteger(index) ||
              Number(index) < 0 ||
              Number(index) >= item.options.length,
          ))) ||
      (item.solution !== undefined &&
        (typeof item.solution !== "string" ||
          item.solution.trim().length > 300))
    )
      throw new Error(
        "Bitte alle Fragen und Antworten ausfüllen (max. 1000 Zeichen je Frage, 300 je Antwort bzw. Lösung und acht Antworten).",
      );
    used.add(item.number);
    const solution =
      item.options.length === 0 && typeof item.solution === "string"
        ? item.solution.trim()
        : "";
    return {
      number: item.number,
      text: item.text.trim(),
      options: item.options.map((option: string) => option.trim()),
      ...(item.correctOptions?.length
        ? { correctOptions: [...new Set<number>(item.correctOptions)] }
        : {}),
      ...(solution ? { solution } : {}),
    };
  });
}
export function serializeQuestions(questions: PreparedQuestion[]): string {
  if (
    questions.some(
      (item) =>
        /[;\r\n]/.test(item.text) ||
        /[\r\n]/.test(item.solution ?? "") ||
        item.options.some(
          (option) => /[()\r\n]/.test(option) || option.endsWith("*"),
        ),
    )
  )
    throw new Error(
      "Diese Inhalte enthalten Sonderzeichen des Textformats. Bitte im Editor weiterbearbeiten.",
    );
  return questions
    .map((item) => {
      if (!item.options.length)
        return `${item.number}. ${item.text}${item.solution ? `; =${item.solution}` : ""}`;
      return `${item.number}. ${item.text}; ${item.options.map((option, index) => `(${option}${item.correctOptions?.includes(index) ? "*" : ""})`).join(" ")}`;
    })
    .join("\n");
}
