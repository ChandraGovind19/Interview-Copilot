import { createClient } from "@supabase/supabase-js";

import { getRequiredEnv } from "@/lib/env";
import type { DashboardSnapshot, SessionSummary } from "@/lib/types";

interface SessionFeedbackScoreRecord {
  overall_score: number | null;
}

interface SessionAnswerRecord {
  id: string;
  feedback: SessionFeedbackScoreRecord[] | null;
}

interface SessionRecord {
  id: string;
  title: string;
  job_role: string | null;
  created_at: string;
  answers: SessionAnswerRecord[] | null;
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
