import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getSTARFeedback } from "@/lib/openai";
import { feedbackRequestSchema } from "@/lib/schemas";
import { createSupabaseAdminClient, getSessionForUser } from "@/lib/supabase";
import type { FeedbackRow } from "@/lib/types";

interface FeedbackRowRecord {
  id: string;
  answer_id: string;
  situation_score: number;
  task_score: number;
  action_score: number;
  result_score: number;
  overall_score: number;
  revised_situation_score: number;
  revised_task_score: number;
  revised_action_score: number;
  revised_result_score: number;
  revised_overall_score: number;
  situation_feedback: string;
  task_feedback: string;
  action_feedback: string;
  result_feedback: string;
  overall_summary: string;
  revised_overall_summary: string;
  improvement_summary: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improved_answer: string;
  keywords_used: string[] | null;
  keywords_missing: string[] | null;
}

function mapFeedbackRow(row: FeedbackRowRecord): FeedbackRow {
  return {
    id: row.id,
    answerId: row.answer_id,
    situationScore: row.situation_score,
    taskScore: row.task_score,
    actionScore: row.action_score,
    resultScore: row.result_score,
    overallScore: row.overall_score,
    revisedSituationScore: row.revised_situation_score,
    revisedTaskScore: row.revised_task_score,
    revisedActionScore: row.revised_action_score,
    revisedResultScore: row.revised_result_score,
    revisedOverallScore: row.revised_overall_score,
    situationFeedback: row.situation_feedback,
    taskFeedback: row.task_feedback,
    actionFeedback: row.action_feedback,
    resultFeedback: row.result_feedback,
    overallSummary: row.overall_summary,
    revisedOverallSummary: row.revised_overall_summary,
    improvementSummary: row.improvement_summary,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    improvedAnswer: row.improved_answer,
    keywordsUsed: row.keywords_used ?? [],
    keywordsMissing: row.keywords_missing ?? [],
  };
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv() || !hasOpenAIEnv()) {
    return NextResponse.json(
      { error: "OpenAI and Supabase must be configured before feedback can run." },
      { status: 500 },
    );
  }

  const json = await request.json();
  const parsed = feedbackRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const payload = parsed.data;

  let answerId: string | null = null;

  try {
    const session = await getSessionForUser(payload.sessionId, userId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or does not belong to the current user." },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to verify the current session.",
      },
      { status: 500 },
    );
  }

  const { data: insertedAnswer, error: insertedAnswerError } = await supabase
    .from("answers")
    .insert({
      session_id: payload.sessionId,
      clerk_user_id: userId,
      question: payload.question,
      question_category: payload.questionCategory,
      answer_text: payload.answerText,
    })
    .select()
    .single();

  if (insertedAnswerError) {
    return NextResponse.json({ error: insertedAnswerError.message }, { status: 500 });
  }

  answerId = insertedAnswer.id;

  try {
    const starFeedback = await getSTARFeedback(
      payload.question,
      payload.answerText,
      payload.jobRole,
    );

    const { data: feedbackRow, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        answer_id: insertedAnswer.id,
        clerk_user_id: userId,
        situation_score: starFeedback.original.situation.score,
        task_score: starFeedback.original.task.score,
        action_score: starFeedback.original.action.score,
        result_score: starFeedback.original.result.score,
        overall_score: starFeedback.original.overall.score,
        revised_situation_score: starFeedback.revised.situation.score,
        revised_task_score: starFeedback.revised.task.score,
        revised_action_score: starFeedback.revised.action.score,
        revised_result_score: starFeedback.revised.result.score,
        revised_overall_score: starFeedback.revised.overall.score,
        situation_feedback: starFeedback.original.situation.feedback,
        task_feedback: starFeedback.original.task.feedback,
        action_feedback: starFeedback.original.action.feedback,
        result_feedback: starFeedback.original.result.feedback,
        overall_summary: starFeedback.original.overall.summary,
        revised_overall_summary: starFeedback.revised.overall.summary,
        improvement_summary: starFeedback.rewrite.improvementSummary,
        strengths: starFeedback.original.overall.strengths,
        weaknesses: starFeedback.original.overall.weaknesses,
        improved_answer: starFeedback.rewrite.improvedAnswer,
        keywords_used: starFeedback.original.overall.keywordsUsed,
        keywords_missing: starFeedback.original.overall.keywordsMissing,
      })
      .select()
      .single();

    if (feedbackError) {
      throw new Error(feedbackError.message);
    }

    return NextResponse.json({ answer: insertedAnswer, feedback: mapFeedbackRow(feedbackRow) });
  } catch (error) {
    if (answerId) {
      await supabase.from("answers").delete().eq("id", answerId).eq("clerk_user_id", userId);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to generate STAR feedback right now.",
      },
      { status: 500 },
    );
  }
}
