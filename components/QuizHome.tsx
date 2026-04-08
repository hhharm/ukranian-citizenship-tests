"use client";

import Link from "next/link";
import { IconBooks, IconDice5, IconRotateClockwise, IconX, IconHistory, IconScale } from "@tabler/icons-react";
import { Topic } from "@/data/types";

type QuizMode = "random" | "new" | "failed" | "rewind";

interface TopicStats {
  newCount: number;
  failedCount: number;
  practicedCount: number;
}

interface Props {
  onStart: (topic: Topic, mode: QuizMode) => void;
  stats: Record<Topic, TopicStats> | null;
}

function UkrainianFlag({ className }: { className?: string }) {
  return (
    <div className={`rounded-md overflow-hidden shadow-md flex flex-col ${className}`}>
      <div className="flex-1 bg-[#0057B7]" />
      <div className="flex-1 bg-[#FFD700]" />
    </div>
  );
}

function ModeButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  count,
  color,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count?: number;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm font-medium px-3 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
        disabled
          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
          : `bg-white border-gray-200 ${color} hover:bg-gray-50 cursor-pointer`
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="shrink-0 text-sm font-bold text-gray-500">({count})</span>
      )}
    </button>
  );
}

function TopicCard({
  topic,
  icon: Icon,
  title,
  description,
  stripe,
  stats,
  onStart,
}: {
  topic: Topic;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  stripe: string;
  stats: TopicStats | undefined;
  onStart: (mode: QuizMode) => void;
}) {
  const colorMap = {
    history: "text-[#0057B7]",
    constitution: "text-amber-600",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 text-left shadow-sm border border-gray-100 bg-white">
      <div className={`absolute inset-y-0 left-0 w-1.5 ${stripe} rounded-l-2xl`} />
      <div className="pl-3">
        <div className="text-3xl mb-3"><Icon size={48} className="text-gray-900" /></div>
        <div className="font-bold text-xl text-gray-900">{title}</div>
        <div className="text-sm text-gray-500 mt-2 leading-relaxed mb-4">
          {description}
        </div>

        {stats ? (
          <div className="flex flex-col gap-2">
            <ModeButton
              onClick={() => onStart("new")}
              disabled={stats.newCount === 0}
              icon={IconBooks}
              label="Нові питання"
              count={stats.newCount}
              color={colorMap[topic]}
            />
            <ModeButton
              onClick={() => onStart("random")}
              disabled={false}
              icon={IconDice5}
              label="20 випадкових"
              color={colorMap[topic]}
            />
            <ModeButton
              onClick={() => onStart("rewind")}
              disabled={stats.practicedCount === 0}
              icon={IconRotateClockwise}
              label="Повторити вивчене"
              count={stats.practicedCount}
              color={colorMap[topic]}
            />
            <ModeButton
              onClick={() => onStart("failed")}
              disabled={stats.failedCount === 0}
              icon={IconX}
              label="Помилки"
              count={stats.failedCount}
              color="text-red-600"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-400 py-2.5">Завантаження…</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizHome({ onStart, stats }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Flag stripe header */}
      <div className="h-1.5 flex">
        <div className="flex-1 bg-[#0057B7]" />
        <div className="flex-1 bg-[#FFD700]" />
      </div>

      <div className="flex flex-col items-center gap-10 py-16 px-4 flex-1">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <UkrainianFlag className="w-14 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Підготовка до тесту
          </h1>
          <p className="text-gray-500 text-lg max-w-sm mx-auto">
            Перевір свої знання з історії та конституції України
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          <TopicCard
            topic="history"
            icon={IconHistory}
            title="Історія України"
            description="Тест на знання ключових подій, постатей та процесів"
            stripe="bg-[#0057B7]"
            stats={stats?.history}
            onStart={(mode) => onStart("history", mode)}
          />
          <TopicCard
            topic="constitution"
            icon={IconScale}
            title="Конституція України"
            description="Тест на знання основного закону держави"
            stripe="bg-[#FFD700]"
            stats={stats?.constitution}
            onStart={(mode) => onStart("constitution", mode)}
          />
        </div>

        <Link
          href="/history"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
        >
          Статистика та історія спроб →
        </Link>
      </div>
    </div>
  );
}
