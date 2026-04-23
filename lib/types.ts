export interface FeedbackRow {
  id: string;
  answerId: string;
  situationScore: number;
  taskScore: number;
  actionScore: number;
  resultScore: number;
  overallScore: number;
  situationFeedback: string;
  taskFeedback: string;
  actionFeedback: string;
  resultFeedback: string;
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  keywordsUsed: string[];
  keywordsMissing: string[];
}

export interface SessionAnswerHistory {
  id: string;
  question: string;
  questionCategory: string | null;
  answerText: string;
  createdAt: string;
  feedback: FeedbackRow | null;
}

export interface SessionSummary {
  id: string;
  title: string;
  jobRole: string | null;
  createdAt: string;
  answerCount: number;
  avgScore: number | null;
}

export interface SessionDetail extends SessionSummary {
  answers: SessionAnswerHistory[];
}

export interface DashboardSnapshot {
  sessions: SessionSummary[];
  stats: {
    totalSessions: number;
    totalAnswers: number;
    averageScore: number | null;
  };
}

export interface ApiFeedbackResponse {
  answer: {
    id: string;
    question: string;
    question_category: string | null;
    answer_text: string;
    created_at: string;
  };
  feedback: FeedbackRow;
}
