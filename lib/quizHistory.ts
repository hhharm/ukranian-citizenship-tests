import { QuizAttempt, Topic } from "@/data/types";

const STORAGE_KEY = "quiz_history";

export function loadHistory(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: QuizAttempt): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  history.unshift(attempt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// All question IDs that appeared in any attempt for this topic
export function getPracticedIds(topic: Topic): Set<number> {
  return new Set(
    loadHistory()
      .filter((a) => a.topic === topic)
      .flatMap((a) => a.questions.map((q) => q.id))
  );
}

// Question IDs that were most recently answered INCORRECTLY for this topic
// (only includes questions where the last time they were seen, the answer was wrong)
export function getFailedIds(topic: Topic): Set<number> {
  const history = loadHistory().filter((a) => a.topic === topic);
  // history is stored newest-first (unshift in saveAttempt)
  const seen = new Set<number>();
  const failed = new Set<number>();
  for (const attempt of history) {
    for (const q of attempt.questions) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        if (!q.correct) failed.add(q.id);
      }
    }
  }
  return failed;
}
