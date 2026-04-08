"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconChevronUp, IconCheck, IconClipboard } from "@tabler/icons-react";
import { QuizAttempt, Topic } from "@/data/types";
import { loadHistory, clearHistory } from "@/lib/quizHistory";

const TOPIC_LABEL: Record<Topic, string> = {
  history: "Історія",
  constitution: "Конституція",
};

const TOPIC_COLOR: Record<Topic, string> = {
  history: "text-[#0057B7] bg-blue-50 border-blue-200",
  constitution: "text-amber-700 bg-amber-50 border-amber-200",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const color =
    pct >= 90
      ? "text-green-700 bg-green-50 border-green-200"
      : pct >= 75
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : pct >= 60
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}/{total} ({pct}%)
    </span>
  );
}

function AttemptCard({ attempt }: { attempt: QuizAttempt }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const wrong = attempt.questions.filter((q) => !q.correct);

  function handleFix() {
    if (wrong.length === 0) return;
    const ids = wrong.map((q) => q.id).join(",");
    router.push(`/?mode=fix&topic=${attempt.topic}&ids=${ids}`);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TOPIC_COLOR[attempt.topic]}`}
            >
              {TOPIC_LABEL[attempt.topic]}
            </span>
            <ScoreBadge score={attempt.score} total={attempt.total} />
          </div>
          <div className="text-xs text-gray-400 mt-1">{formatDate(attempt.date)}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {wrong.length > 0 && (
            <button
              onClick={handleFix}
              className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
            >
              Виправити ({wrong.length})
            </button>
          )}
          {wrong.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="cursor-pointer text-xs font-medium px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </button>
          )}
          {wrong.length === 0 && (
            <span className="text-green-600 text-sm font-bold flex items-center gap-1">
              <IconCheck size={16} />
              Без помилок
            </span>
          )}
        </div>
      </div>

      {expanded && wrong.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Помилки
          </div>
          {wrong.map((q) => (
            <div key={q.id} className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="text-gray-800 font-medium mb-2 leading-relaxed">{q.text}</p>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1.5 items-start text-red-700">
                  <span className="font-bold shrink-0">{q.chosen})</span>
                  <span>ваш вибір</span>
                </div>
                <div className="flex gap-1.5 items-start text-green-700">
                  <span className="font-bold shrink-0">{q.answer})</span>
                  <span>правильна відповідь</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuizHistory() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
    setLoaded(true);
  }, []);

  function handleClear() {
    if (confirm("Видалити всю історію спроб?")) {
      clearHistory();
      setHistory([]);
    }
  }

  // Aggregate stats
  const totalAttempts = history.length;
  const historyAttempts = history.filter((a) => a.topic === "history");
  const constitutionAttempts = history.filter((a) => a.topic === "constitution");
  const avgScore = (attempts: QuizAttempt[]) => {
    if (!attempts.length) return null;
    const pcts = attempts.map((a) => Math.round((a.score / a.total) * 100));
    return Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Flag stripe */}
      <div className="h-1.5 flex">
        <div className="flex-1 bg-[#0057B7]" />
        <div className="flex-1 bg-[#FFD700]" />
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
            <p className="text-sm text-gray-500 mt-0.5">Ваші попередні спроби</p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
          >
            ← Головна
          </Link>
        </div>

        {/* Summary cards */}
        {loaded && totalAttempts > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-gray-900">{totalAttempts}</div>
              <div className="text-xs text-gray-500 mt-0.5">Спроб</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-[#0057B7]">
                {avgScore(historyAttempts) ?? "—"}
                {avgScore(historyAttempts) != null && (
                  <span className="text-base font-medium text-gray-400">%</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Історія (сер.)</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-amber-600">
                {avgScore(constitutionAttempts) ?? "—"}
                {avgScore(constitutionAttempts) != null && (
                  <span className="text-base font-medium text-gray-400">%</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Конституція (сер.)</div>
            </div>
          </div>
        )}

        {/* Attempts list */}
        {!loaded ? (
          <div className="text-center text-gray-400 py-16">Завантаження…</div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <IconClipboard size={48} className="text-gray-400" />
            <div className="text-gray-500">Ще немає жодної спроби</div>
            <Link
              href="/"
              className="mt-2 text-sm font-semibold text-[#0057B7] hover:underline"
            >
              Почати перший тест →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {history.map((attempt) => (
                <AttemptCard key={attempt.id} attempt={attempt} />
              ))}
            </div>

            <button
              onClick={handleClear}
              className="cursor-pointer self-center text-xs text-gray-400 hover:text-red-500 transition-colors py-2 px-4"
            >
              Очистити історію
            </button>
          </>
        )}
      </div>
    </div>
  );
}
