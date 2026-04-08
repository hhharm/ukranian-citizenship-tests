"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Topic, Question, OptionId, QuizResult, QuizAttempt } from "@/data/types";
import { historyQuestions } from "@/data/historyQuestions";
import { constitutionQuestions } from "@/data/constitutionQuestions";
import { saveAttempt, getPracticedIds, getFailedIds } from "@/lib/quizHistory";
import QuizHome from "./QuizHome";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";

type Screen = "home" | "quiz" | "results";
type QuizMode = "random" | "new" | "failed" | "rewind";

const QUESTIONS_PER_QUIZ = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [screen, setScreen] = useState<Screen>("home");
  const [topic, setTopic] = useState<Topic>("history");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, OptionId>>({});
  const [statsRefresh, setStatsRefresh] = useState(0);

  const startQuizWithQuestions = useCallback(
    (selectedTopic: Topic, qs: Question[]) => {
      setTopic(selectedTopic);
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswers({});
      setScreen("quiz");
    },
    []
  );

  const startQuiz = useCallback(
    (selectedTopic: Topic, mode: QuizMode = "random") => {
      const source =
        selectedTopic === "history" ? historyQuestions : constitutionQuestions;

      let filtered = source;

      if (mode === "new") {
        const practiced = getPracticedIds(selectedTopic);
        filtered = source.filter((q) => !practiced.has(q.id));
      } else if (mode === "failed") {
        const failed = getFailedIds(selectedTopic);
        filtered = source.filter((q) => failed.has(q.id));
      } else if (mode === "rewind") {
        const practiced = getPracticedIds(selectedTopic);
        filtered = source.filter((q) => practiced.has(q.id));
      }

      const take = mode === "failed" ? filtered.length : QUESTIONS_PER_QUIZ;
      startQuizWithQuestions(
        selectedTopic,
        shuffle(filtered).slice(0, take)
      );
    },
    [startQuizWithQuestions]
  );

  // Compute stats for home screen (recalculate when returning to home)
  const stats = useMemo(() => {
    if (!isClient) return null;

    const computeTopicStats = (t: Topic) => {
      const source = t === "history" ? historyQuestions : constitutionQuestions;
      const practiced = getPracticedIds(t);
      const failed = getFailedIds(t);

      return {
        newCount: source.filter((q) => !practiced.has(q.id)).length,
        failedCount: failed.size,
        practicedCount: practiced.size,
      };
    };

    return {
      history: computeTopicStats("history"),
      constitution: computeTopicStats("constitution"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsRefresh, isClient]); // statsRefresh triggers recalc when returning to home

  // Set isClient flag and refresh stats when returning to home screen
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (screen === "home" && isClient) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatsRefresh((prev) => prev + 1);
    }
  }, [screen, isClient]);

  // Handle fix mode from URL params (?mode=fix&topic=history&ids=1,3,5)
  useEffect(() => {
    const mode = searchParams.get("mode");
    const topicParam = searchParams.get("topic") as Topic | null;
    const idsParam = searchParams.get("ids");

    if (mode === "fix" && topicParam && idsParam) {
      const ids = new Set(idsParam.split(",").map(Number));
      const source =
        topicParam === "history" ? historyQuestions : constitutionQuestions;
      const fixQuestions = source.filter((q) => ids.has(q.id));
      if (fixQuestions.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        startQuizWithQuestions(topicParam, shuffle(fixQuestions));
        router.replace("/");
      }
    }
  }, [searchParams, startQuizWithQuestions, router]);

  const handleAnswer = useCallback(
    (optionId: OptionId) => {
      const qId = questions[currentIndex].id;
      setAnswers((prev) => ({ ...prev, [qId]: optionId }));
    },
    [questions, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      // Save attempt before showing results
      const finalResults = questions.map((q) => ({
        id: q.id,
        text: q.text,
        chosen: answers[q.id],
        correct: answers[q.id] === q.answer,
        answer: q.answer,
      }));
      const attempt: QuizAttempt = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        topic,
        score: finalResults.filter((r) => r.correct).length,
        total: finalResults.length,
        questions: finalResults,
      };
      saveAttempt(attempt);
      setScreen("results");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions, topic, answers]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevQuestion = questions[currentIndex - 1];
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[prevQuestion.id];
        return next;
      });
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, questions]);

  const results: QuizResult[] = questions.map((q) => ({
    question: q,
    chosen: answers[q.id],
    correct: answers[q.id] === q.answer,
  }));

  const handleFixFailed = useCallback(() => {
    const wrongQuestions = results
      .filter((r) => !r.correct)
      .map((r) => r.question);
    if (wrongQuestions.length > 0) {
      startQuizWithQuestions(topic, shuffle(wrongQuestions));
    }
  }, [results, topic, startQuizWithQuestions]);

  if (screen === "home") {
    return <QuizHome onStart={startQuiz} stats={stats} />;
  }

  if (screen === "quiz") {
    const current = questions[currentIndex];
    const chosen = answers[current.id] ?? null;
    return (
      <QuizQuestion
        question={current}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        chosen={chosen}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={currentIndex > 0 ? handleBack : undefined}
        onHome={() => setScreen("home")}
      />
    );
  }

  return (
    <QuizResults
      results={results}
      topic={topic}
      onRestart={() => startQuiz(topic)}
      onHome={() => setScreen("home")}
      onFixFailed={results.some((r) => !r.correct) ? handleFixFailed : undefined}
    />
  );
}
