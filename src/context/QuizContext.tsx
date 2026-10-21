import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export const QUIZ_STATUS_KEY = "pubquiz-running";
const Context = createContext<{
  running: boolean;
  ready: boolean;
  error: string | null;
  setRunning: (running: boolean) => boolean;
} | null>(null);
export function QuizProvider({ children }: { children: ReactNode }) {
  const [running, updateRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    function read() {
      try {
        updateRunning(localStorage.getItem(QUIZ_STATUS_KEY) === "true");
        setError(null);
      } catch {
        setError("Der Quizstatus konnte nicht geladen werden.");
      }
    }
    read();
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key === QUIZ_STATUS_KEY || event.key === null) read();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function setRunning(next: boolean) {
    if (!ready) return false;
    try {
      localStorage.setItem(QUIZ_STATUS_KEY, String(next));
      updateRunning(next);
      setError(null);
      return true;
    } catch {
      setError("Der Quizstatus konnte nicht gespeichert werden.");
      return false;
    }
  }
  return (
    <Context.Provider value={{ running, ready, error, setRunning }}>
      {children}
    </Context.Provider>
  );
}
export function useQuiz() {
  const value = useContext(Context);
  if (!value) throw new Error("QuizProvider fehlt");
  return value;
}
