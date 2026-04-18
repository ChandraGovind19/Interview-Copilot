import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { DEFAULT_OPENAI_MODEL, getRequiredEnv } from "@/lib/env";
import { starFeedbackSchema, type STARFeedback } from "@/lib/schemas";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: getRequiredEnv("OPENAI_API_KEY"),
    });
  }

  return client;
}

export async function getSTARFeedback(
  question: string,
  answer: string,
  jobRole?: string,
): Promise<STARFeedback> {
  const response = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert behavioral interview coach.",
      "Evaluate the candidate using the STAR framework: Situation, Task, Action, Result.",
      "Be specific, direct, and constructive.",
      "Reward quantified impact, ownership, and clarity.",
      "Penalize vague context, missing ownership, or missing measurable outcomes.",
      jobRole ? `Calibrate feedback for a ${jobRole} role.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      `Interview question: ${question}`,
      `Candidate answer: ${answer}`,
      "Return STAR component scores, actionable feedback, an overall summary, strengths, weaknesses,",
      "an improved answer rewrite, and high-value keywords used or missing.",
    ].join("\n\n"),
    text: {
      format: zodTextFormat(starFeedbackSchema, "star_feedback"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return parsed STAR feedback.");
  }

  return response.output_parsed;
}
