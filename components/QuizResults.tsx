"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconTrophy, IconThumbUp, IconBooks, IconAlertTriangle, IconCheck, IconX, IconArrowRight } from "@tabler/icons-react";
import { QuizResult, Topic } from "@/data/types";

interface Props {
  results: QuizResult[];
  topic: Topic;
  onRestart: () => void;
  onHome: () => void;
  onFixFailed?: () => void;
}

const TOPIC_LABEL: Record<Topic, string> = {
  history: "Історія України",
  constitution: "Конституція України",
};

export default function QuizResults({
  results,
  topic,
  onRestart,
  onHome,
  onFixFailed,
}: Props) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  const grade =
    pct >= 90
      ? { label: "Відмінно!", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: IconTrophy }
      : pct >= 75
      ? { label: "Добре!", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: IconThumbUp }
      : pct >= 60
      ? { label: "Задовільно", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: IconBooks }
      : { label: "Потрібно вчити", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: IconAlertTriangle };

  const wrong = results.filter((r) => !r.correct);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRestart();
      }
      if (e.key === "Escape") {
        onHome();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRestart, onHome]);

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto w-full px-4">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-5 py-6">
        {/* Score card */}
        <div className={`rounded-2xl p-6 shadow-sm border text-center ${grade.bg}`}>
          <div className="text-5xl mb-2"><grade.icon size={48} className={grade.color} /></div>
          <div className={`text-2xl font-bold mb-1 ${grade.color}`}>{grade.label}</div>
          <div className="text-6xl font-black text-gray-900 my-3 tabular-nums">
            {correct}
            <span className="text-2xl font-medium text-gray-400">/{total}</span>
          </div>
          <div className="text-gray-600 text-sm font-medium">{pct}% правильних відповідей</div>
          <div className="text-gray-400 text-xs mt-1">{TOPIC_LABEL[topic]}</div>

          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mt-5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(to right, #0057B7, #FFD700)",
              }}
            />
          </div>
        </div>

        {/* Wrong answers review */}
        {wrong.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider">
              Помилки ({wrong.length})
            </h2>
            <div className="flex flex-col gap-3">
              {wrong.map(({ question, chosen }) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed">
                    {question.text}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {question.options.map((opt) => {
                      const isCorrect = opt.id === question.answer;
                      const isChosen = opt.id === chosen;
                      if (!isCorrect && !isChosen) return null;
                      return (
                        <div
                          key={opt.id}
                          className={`text-xs rounded-lg px-3 py-2 flex gap-2 items-start ${
                            isCorrect
                              ? "bg-green-50 text-green-800 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <span className="font-bold shrink-0">{opt.id})</span>
                          <span className="flex-1">{opt.text}</span>
                          <span className="ml-auto shrink-0 font-medium flex items-center gap-1">
                            {isCorrect ? (
                              <>
                                <IconCheck size={16} />
                                правильно
                              </>
                            ) : (
                              <>
                                <IconX size={16} />
                                ваш вибір
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar — always visible */}
      <div className="shrink-0 py-3 flex flex-col gap-2 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="cursor-pointer flex-1 bg-[#0057B7] text-white rounded-xl py-3 font-semibold hover:bg-blue-800 active:bg-blue-900 transition-colors flex items-center justify-center gap-2"
          >
            Пройти знову
            <IconArrowRight size={18} className="text-white/60" />
          </button>
          <button
            onClick={onHome}
            className="cursor-pointer flex-1 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Головна
            <kbd className="text-xs font-mono bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
          </button>
        </div>
        <div className="flex gap-3">
          {onFixFailed && (
            <button
              onClick={onFixFailed}
              className="cursor-pointer flex-1 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl py-2.5 font-semibold hover:bg-red-100 hover:border-red-300 transition-colors text-sm"
            >
              Виправити помилки ({wrong.length})
            </button>
          )}
          <Link
            href="/history"
            className="flex-1 bg-gray-50 border-2 border-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm text-center"
          >
            Статистика
          </Link>
        </div>
      </div>
    </div>
  );
}
