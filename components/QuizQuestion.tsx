"use client";

import { useEffect } from "react";
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconArrowLeft,
  IconChecks,
  IconRobot,
} from "@tabler/icons-react";
import { Question, OptionId } from "@/data/types";
import classNames from "classnames";

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  chosen: OptionId | null;
  onAnswer: (optionId: OptionId) => void;
  onNext: () => void;
  onBack?: () => void;
  onHome: () => void;
}

// Supports both digit keys (1-4) and Cyrillic letters (а/б/в/г)
const KEY_TO_OPTION: Record<string, OptionId> = {
  "1": "а",
  а: "а",
  "2": "б",
  б: "б",
  "3": "в",
  в: "в",
  "4": "г",
  г: "г",
};

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  chosen,
  onAnswer,
  onNext,
  onBack,
  onHome,
}: Props) {
  const isAnswered = chosen !== null;
  const progress = (questionNumber / totalQuestions) * 100;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't steal keys from focused form elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (!isAnswered) {
        const opt = KEY_TO_OPTION[e.key];
        if (opt) onAnswer(opt);
      } else {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          onNext();
        }
      }

      if ((e.key === "ArrowLeft" || e.key === "Backspace") && onBack) {
        e.preventDefault();
        onBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, onAnswer, onNext, onBack]);

  function optionStyle(optionId: OptionId) {
    if (!isAnswered) {
      return "bg-white border-2 border-gray-200 hover:border-[#0057B7] hover:bg-blue-50 cursor-pointer text-gray-800";
    }
    if (optionId === question.answer) {
      return "bg-green-50 border-2 border-green-400 text-green-900";
    }
    if (optionId === chosen) {
      return "bg-red-50 border-2 border-red-400 text-red-900";
    }
    return "bg-gray-50 border-2 border-gray-100 text-gray-400";
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto w-full px-4">
      {/* Progress — always visible at top */}
      <div className="shrink-0 pt-6 pb-4">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span>
            Питання {questionNumber} з {totalQuestions}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(to right, #0057B7, #FFD700)`,
            }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 pb-4">
        {/* Question */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-start justify-between gap-4">
            <p className="text-gray-900 text-base leading-relaxed font-medium flex-1">
              {question.text}
            </p>
            <div>
              {isAnswered && (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 shrink-0">
                  {question.humanChecked ? (
                    <IconChecks size={18} className="text-green-600" />
                  ) : (
                    <IconRobot size={18} className="text-blue-600" />
                  )}
                  <span
                    className={classNames(
                      "text-xs font-medium",
                      question.humanChecked
                        ? "text-green-700"
                        : "text-blue-700",
                    )}
                  >
                    {question.humanChecked
                      ? "Відповідь перевірена людиною"
                      : "Відповідь знайдена ШІ, може містити помилки"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((option, i) => (
            <button
              key={option.id}
              disabled={isAnswered}
              onClick={() => onAnswer(option.id)}
              className={`w-full rounded-xl p-4 text-left transition-all duration-150 flex gap-3 items-start ${optionStyle(option.id)}`}
            >
              <span className="font-bold min-w-[1.5rem] text-sm mt-0.5 shrink-0">
                {option.id})
              </span>
              <span className="text-sm leading-relaxed flex-1">
                {option.text}
              </span>
              {!isAnswered && (
                <kbd className="ml-auto text-xs text-gray-300 font-mono bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 shrink-0 self-center">
                  {i + 1}
                </kbd>
              )}
              {isAnswered && option.id === question.answer && (
                <IconCheck
                  size={20}
                  className="ml-auto text-green-600 font-bold shrink-0"
                />
              )}
              {isAnswered &&
                option.id === chosen &&
                chosen !== question.answer && (
                  <IconX
                    size={20}
                    className="ml-auto text-red-500 font-bold shrink-0"
                  />
                )}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <div className="rounded-xl p-4 bg-blue-50 border border-blue-200 text-sm text-blue-900 leading-relaxed">
            <span className="font-semibold block mb-1">Пояснення</span>
            {question.explanation}
          </div>
        )}
      </div>

      {/* Bottom bar — always visible */}
      <div className="shrink-0 py-3 flex flex-col gap-2 border-t border-gray-100">
        {isAnswered && (
          <button
            onClick={onNext}
            className="cursor-pointer w-full bg-[#0057B7] text-white rounded-xl py-3 px-6 font-semibold hover:bg-blue-800 active:bg-blue-900 transition-colors flex items-center justify-center gap-3"
          >
            {questionNumber < totalQuestions
              ? "Наступне питання →"
              : "Завершити тест →"}
            <IconArrowRight size={18} className="text-white/60" />
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <IconArrowLeft size={16} className="text-gray-600" />
                Назад
              </button>
            )}
          </div>
          <button
            onClick={onHome}
            className="cursor-pointer flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            На головну
          </button>
        </div>
      </div>
    </div>
  );
}
