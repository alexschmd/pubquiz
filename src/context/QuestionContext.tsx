import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export const QUESTION_KEY = "pubquiz-question";
export interface QuizQuestion {
  text: string;
  endsAt: number;
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
  return { text: data.text, endsAt: data.endsAt };
}
interface QuestionState {
  question: QuizQuestion | null;
  ready: boolean;
  error: string | null;
  publish: (text: string, seconds: number) => boolean;
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
  function publish(text: string, seconds: number) {
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
    return persist({ text: text.trim(), endsAt: Date.now() + seconds * 1000 });
  }
  return (
    <Context.Provider
      value={{
        question,
        ready,
        error,
        publish,
        dismiss: () => {
          if (ready) persist(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useQuestion() {
  const state = useContext(Context);
  if (!state) throw new Error("QuestionProvider fehlt");
  return state;
}
export function useRemainingSeconds(question: QuizQuestion | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!question) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [question]);
  return question ? Math.max(0, Math.ceil((question.endsAt - now) / 1000)) : 0;
}
export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
