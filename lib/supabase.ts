import { createClient } from "@supabase/supabase-js";

import { getRequiredEnv } from "@/lib/env";
import type { DashboardSnapshot, FeedbackRow, SessionDetail, SessionSummary } from "@/lib/types";

interface SessionFeedbackScoreRecord {
  id: string;
  answer_id: string;
  overall_score: number | null;
  situation_score: number | null;
  task_score: number | null;
  action_score: number | null;
  result_score: number | null;
  situation_feedback: string | null;
  task_feedback: string | null;
  action_feedback: string | null;
  result_feedback: string | null;
  overall_summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improved_answer: string | null;
  keywords_used: string[] | null;
  keywords_missing: string[] | null;
}

interface SessionAnswerRecord {
  id: string;
  question: string;
  question_category: string | null;
  answer_text: string;
  created_at: string;
  feedback: SessionFeedbackScoreRecord[] | null;
}

interface SessionRecord {
  id: string;
  title: string;
  job_role: string | null;
  created_at: string;
  answers: SessionAnswerRecord[] | null;
}

function mapFeedbackRow(row: SessionFeedbackScoreRecord): FeedbackRow {
  return {
    id: row.id,
    answerId: row.answer_id,
    situationScore: row.situation_score ?? 0,
    taskScore: row.task_score ?? 0,
    actionScore: row.action_score ?? 0,
    resultScore: row.result_score ?? 0,
    overallScore: row.overall_score ?? 0,
    situationFeedback: row.situation_feedback ?? "",
    taskFeedback: row.task_feedback ?? "",
    actionFeedback: row.action_feedback ?? "",
    resultFeedback: row.result_feedback ?? "",
    overallSummary: row.overall_summary ?? "",
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    improvedAnswer: row.improved_answer ?? "",
    keywordsUsed: row.keywords_used ?? [],
    keywordsMissing: row.keywords_missing ?? [],
  };
}

export function createSupabaseAdminClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function getSessionForUser(sessionId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, clerk_user_id")
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateSessionForUser(
  sessionId: string,
  userId: string,
  updates: { title: string; jobRole?: string },
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      title: updates.title,
      job_role: updates.jobRole?.trim() ? updates.jobRole.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteSessionForUser(sessionId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("clerk_user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSessionDetailForUser(
  sessionId: string,
  userId: string,
): Promise<SessionDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
        id,
        title,
        job_role,
        created_at,
        answers (
          id,
          question,
          question_category,
          answer_text,
          created_at,
          feedback (
            id,
            answer_id,
            overall_score,
            situation_score,
            task_score,
            action_score,
            result_score,
            situation_feedback,
            task_feedback,
            action_feedback,
            result_feedback,
            overall_summary,
            strengths,
            weaknesses,
            improved_answer,
            keywords_used,
            keywords_missing
          )
        )
      `,
    )
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const answers = ((data.answers ?? []) as SessionAnswerRecord[])
    .map((answer) => ({
      id: answer.id,
      question: answer.question,
      questionCategory: answer.question_category,
      answerText: answer.answer_text,
      createdAt: answer.created_at,
      feedback: answer.feedback?.[0] ? mapFeedbackRow(answer.feedback[0]) : null,
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const scores = answers
    .map((answer) => answer.feedback?.overallScore ?? null)
    .filter((score): score is number => typeof score === "number");

  return {
    id: data.id,
    title: data.title,
    jobRole: data.job_role,
    createdAt: data.created_at,
    answerCount: answers.length,
    avgScore: scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : null,
    answers,
  };
}

export async function getSessionsForUser(userId: string): Promise<SessionSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
        id,
        title,
        job_role,
        created_at,
        answers (
          id,
          feedback ( overall_score )
        )
      `,
    )
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SessionRecord[]).map((session) => {
    const scores = (session.answers ?? [])
      .flatMap((answer) => answer.feedback?.map((row) => row.overall_score) ?? [])
      .filter((score): score is number => typeof score === "number");

    return {
      id: session.id,
      title: session.title,
      jobRole: session.job_role,
      createdAt: session.created_at,
      answerCount: session.answers?.length ?? 0,
      avgScore: scores.length
        ? Math.round(scores.reduce((total: number, score: number) => total + score, 0) / scores.length)
        : null,
    } satisfies SessionSummary;
  });
}

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const sessions = await getSessionsForUser(userId);
  const answeredSessions = sessions.filter((session) => session.avgScore !== null);
  const totalAnswers = sessions.reduce((count, session) => count + session.answerCount, 0);
  const totalScores = answeredSessions.reduce(
    (total, session) => total + (session.avgScore ?? 0) * session.answerCount,
    0,
  );

  return {
    sessions,
    stats: {
      totalSessions: sessions.length,
      totalAnswers,
      averageScore: totalAnswers ? Math.round(totalScores / totalAnswers) : null,
    },
  };
}
