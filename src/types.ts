export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  level: number;
}

export type SubjectType = 'gk' | 'science' | 'history' | 'english' | 'maths' | 'hindi' | 'physics' | 'chemistry' | 'biology';
export type BaselineDifficulty = 'easy' | 'medium' | 'hard';

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  classLevel: number;
  subject: SubjectType;
  points: number;
  score: number; // e.g., 8 (meaning 8/10 or 8/15)
  totalQuestions: number;
  accuracy: number;
  timeSpent: number; // seconds
  date: string;
}

export interface DetailedQuestionResult {
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface GradeReport {
  id: string;
  studentName: string;
  classLevel: number;
  subject: SubjectType;
  pointsWon: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number; // seconds
  date: string;
  results: DetailedQuestionResult[];
  aiFeedback: string;
}
