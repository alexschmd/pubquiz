import type { PreparedQuestion } from "../lib/questions";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
export const QUESTION_KEY = "pubquiz-question";
export interface QuizQuestion {
  text: string;
  endsAt: number;
  number?: number;
  options?: string[];
  visible?: boolean;
  revealedOptions?: number[];
}
export function parseQuestion(raw: string | null): QuizQuestion | null {
  if (!raw) return null;
  const data: unknown = JSON.parse(raw);
  if (data === null) return null;
  if (
    typeof data !== "object" ||
    !("text" in data) ||
    typeof data.text !== "string" ||
    !data.text.trim() ||
    data.text.length > 1000 ||
    !("endsAt" in data) ||
    typeof data.endsAt !== "number" ||
    !Number.isFinite(data.endsAt)
  )
    throw new Error("Ungültige Frage");
  if (
    "number" in data &&
    (!Number.isSafeInteger(data.number) || Number(data.number) < 1)
  )
    throw new Error("Ungültige Nummer");
  if (
    "options" in data &&
    (!Array.isArray(data.options) ||
      data.options.length > 8 ||
      data.options.some(
        (option) =>
          typeof option !== "string" || !option.trim() || option.length > 300,
      ))
  )
    throw new Error("Ungültige Antworten");
  if ("visible" in data && typeof data.visible !== "boolean")
    throw new Error("Ungültige Ansicht");
  if (
    "revealedOptions" in data &&
    (!Array.isArray(data.revealedOptions) ||
      data.revealedOptions.some(
        (index) =>
          !Number.isInteger(index) ||
          index < 0 ||
          index >=
            ("options" in data && Array.isArray(data.options)
              ? data.options.length
              : 0),
      ))
  )
    throw new Error("Ungültige Antwortfreigabe");
  return {
    text: data.text,
    ...("revealedOptions" in data
      ? { revealedOptions: data.revealedOptions as number[] }
      : {}),
    endsAt: data.endsAt,
    ...("number" in data ? { number: data.number as number } : {}),
    ...("options" in data ? { options: data.options as string[] } : {}),
    ...("visible" in data ? { visible: data.visible as boolean } : {}),
  };
}
interface QuestionState {
  question: QuizQuestion | null;
  ready: boolean;
  error: string | null;
  publish: (
    text: string,
    seconds: number,
    details?: Pick<PreparedQuestion, "number" | "options">,
  ) => boolean;
  setQuestionVisible: (visible: boolean) => void;
  revealOptions: (indices: number[]) => void;
  dismiss: () => void;
}
const Context = createContext<QuestionState | null>(null);
export function QuestionProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      setQuestion(parseQuestion(localStorage.getItem(QUESTION_KEY)));
    } catch {
      setError("Die gespeicherte Frage konnte nicht geladen werden.");
    }
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key !== QUESTION_KEY && event.key !== null) return;
      try {
        setQuestion(parseQuestion(event.newValue));
        setError(null);
      } catch {
        setError("Die Frage aus dem anderen Tab konnte nicht geladen werden.");
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const value = useMemo(() => {
    function persist(next: QuizQuestion | null) {
      try {
        localStorage.setItem(QUESTION_KEY, JSON.stringify(next));
        setQuestion(next);
        setError(null);
        return true;
      } catch {
        setError(
          "Die Frage konnte nicht gespeichert werden. Bitte Browserspeicher prüfen.",
        );
        return false;
      }
    }
    function publish(
      text: string,
      seconds: number,
      details?: Pick<PreparedQuestion, "number" | "options">,
    ) {
      if (!ready) return false;
      if (
        !text.trim() ||
        text.trim().length > 1000 ||
        !Number.isInteger(seconds) ||
        seconds < 1 ||
        seconds > 3600
      ) {
        setError(
          "Bitte eine Frage und eine Dauer von 1 bis 3600 Sekunden eingeben.",
        );
        return false;
      }
      return persist({
        text: text.trim(),
        endsAt: Date.now() + seconds * 1000,
        ...(details ? { ...details, visible: true, revealedOptions: [] } : {}),
      });
    }
    return {
      question,
      ready,
      error,
      publish,
      setQuestionVisible: (visible: boolean) => {
        if (ready && question) persist({ ...question, visible });
      },
      revealOptions: (indices: number[]) => {
        if (ready && question)
          persist({
            ...question,
            revealedOptions: [...new Set(indices)].filter(
              (index) =>
                Number.isInteger(index) &&
                index >= 0 &&
                index < (question.options?.length ?? 0),
            ),
          });
      },
      dismiss: () => {
        if (ready) persist(null);
      },
    };
  }, [question, ready, error]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useQuestion() {
  const state = useContext(Context);
  if (!state) throw new Error("QuestionProvider fehlt");
  return state;
}
export function useRemainingSeconds(question: QuizQuestion | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const time = Date.now();
      setNow(time);
      if (!question || time >= question.endsAt) return;
      const untilBoundary = (question.endsAt - time) % 1000;
      timer = setTimeout(tick, untilBoundary || 1000);
    }
    tick();
    return () => clearTimeout(timer);
  }, [question]);
  return question ? Math.max(0, Math.ceil((question.endsAt - now) / 1000)) : 0;
}
export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
