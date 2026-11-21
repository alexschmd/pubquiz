export const BANK_KEY = "pubquiz-question-bank";

function readBank(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    const saved: unknown = raw ? JSON.parse(raw) : null;
    return saved && typeof saved === "object"
      ? (saved as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Number of questions marked as played in the saved question bank. */
export function playedQuestionCount() {
  const played = readBank()?.played;
  return Array.isArray(played) ? played.length : 0;
}

/** Clears the played markers and keeps questions and durations. */
export function clearPlayedQuestions() {
  const saved = readBank();
  if (!saved) return true;
  try {
    localStorage.setItem(BANK_KEY, JSON.stringify({ ...saved, played: [] }));
    return true;
  } catch {
    return false;
  }
}
