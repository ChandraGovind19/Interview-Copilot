import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getSTARFeedback } from "@/lib/openai";
import { feedbackRequestSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { FeedbackRow } from "@/lib/types";

interface FeedbackRowRecord {
  id: string;
  answer_id: string;
  situation_score: number;
  task_score: number;
  action_score: number;
  result_score: number;
  overall_score: number;
  situation_feedback: string;
  task_feedback: string;
  action_feedback: string;
  result_feedback: string;
  overall_summary: string;
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
    situationFeedback: row.situation_feedback,
    taskFeedback: row.task_feedback,
    actionFeedback: row.action_feedback,
    resultFeedback: row.result_feedback,
    overallSummary: row.overall_summary,
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

  const { data: answerRow, error: answerError } = await supabase
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

  if (answerError) {
    return NextResponse.json({ error: answerError.message }, { status: 500 });
  }

  try {
    const starFeedback = await getSTARFeedback(
      payload.question,
      payload.answerText,
      payload.jobRole,
    );

    const { data: feedbackRow, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        answer_id: answerRow.id,
        clerk_user_id: userId,
        situation_score: starFeedback.situation.score,
        task_score: starFeedback.task.score,
        action_score: starFeedback.action.score,
        result_score: starFeedback.result.score,
        overall_score: starFeedback.overall.score,
        situation_feedback: starFeedback.situation.feedback,
        task_feedback: starFeedback.task.feedback,
        action_feedback: starFeedback.action.feedback,
        result_feedback: starFeedback.result.feedback,
        overall_summary: starFeedback.overall.summary,
        strengths: starFeedback.overall.strengths,
        weaknesses: starFeedback.overall.weaknesses,
        improved_answer: starFeedback.overall.improvedAnswer,
        keywords_used: starFeedback.overall.keywordsUsed,
        keywords_missing: starFeedback.overall.keywordsMissing,
      })
      .select()
      .single();

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 });
    }

    return NextResponse.json({ answer: answerRow, feedback: mapFeedbackRow(feedbackRow) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to generate STAR feedback right now.",
      },
      { status: 500 },
    );
  }
}
