import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { generatePersonalizedQuestions } from "@/lib/openai";
import { getExperienceProfileForUser } from "@/lib/supabase";

const personalizedQuestionRequestSchema = z.object({
  sessionRole: z.string().trim().max(160).optional(),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv() || !hasOpenAIEnv()) {
    return NextResponse.json(
      { error: "OpenAI and Supabase must be configured before generating personalized questions." },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = personalizedQuestionRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const profile = await getExperienceProfileForUser(userId);

    if (!profile) {
      return NextResponse.json(
        { error: "Create an experience profile before generating personalized questions." },
        { status: 400 },
      );
    }

    const generated = await generatePersonalizedQuestions(
      profile.sourceText,
      profile.targetRole ?? undefined,
      parsed.data.sessionRole,
    );

    return NextResponse.json(generated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate personalized questions right now.",
      },
      { status: 500 },
    );
  }
}
