export type OptionId = "а" | "б" | "в" | "г";

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  answer: OptionId;
  explanation?: string;
  humanChecked?: boolean;
}

export type Topic = "history" | "constitution";

export interface QuizResult {
  question: Question;
  chosen: OptionId;
  correct: boolean;
}

export interface AttemptQuestion {
  id: number;
  text: string;
  chosen: OptionId;
  correct: boolean;
  answer: OptionId;
}

export interface QuizAttempt {
  id: string;
  date: string; // ISO string
  topic: Topic;
  score: number;
  total: number;
  questions: AttemptQuestion[];
}
