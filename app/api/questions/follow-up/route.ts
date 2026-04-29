import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { generateFollowUpQuestions } from "@/lib/openai";
import { getExperienceProfileForUser } from "@/lib/supabase";

const followUpRequestSchema = z.object({
  question: z.string().trim().min(10).max(300),
  answerText: z.string().trim().min(40).max(5000),
  sessionRole: z.string().trim().max(160).optional(),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv() || !hasOpenAIEnv()) {
    return NextResponse.json(
      { error: "OpenAI and Supabase must be configured before generating follow-up questions." },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = followUpRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const profile = await getExperienceProfileForUser(userId);
    const generated = await generateFollowUpQuestions(
      parsed.data.question,
      parsed.data.answerText,
      profile?.sourceText,
      profile?.targetRole ?? undefined,
      parsed.data.sessionRole,
    );

    return NextResponse.json(generated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate follow-up questions right now.",
      },
      { status: 500 },
    );
  }
}
