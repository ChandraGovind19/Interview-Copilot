import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { DEFAULT_OPENAI_MODEL, getRequiredEnv } from "@/lib/env";
import {
  personalizedQuestionListSchema,
  starFeedbackSchema,
  type PersonalizedQuestionList,
  type STARFeedback,
} from "@/lib/schemas";

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

export async function generatePersonalizedQuestions(
  experienceText: string,
  profileRole?: string,
  sessionRole?: string,
): Promise<PersonalizedQuestionList> {
  const response = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert behavioral interview coach and interviewer.",
      "Generate personalized interview questions based on the candidate's actual background.",
      "Prioritize questions that are specific to the candidate's projects, ownership, tradeoffs, failures, teamwork, and impact.",
      "Return a balanced mix of behavioral, project deep-dive, leadership, conflict, and resume-based questions.",
      "Avoid generic filler questions unless the background is too sparse to do better.",
      profileRole ? `The saved target role is ${profileRole}.` : "",
      sessionRole ? `The active session target role is ${sessionRole}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      "Candidate background:",
      experienceText,
      "",
      "Return 6 to 10 personalized interview questions.",
      "Each item must include a short category label, the question text, and a one-sentence rationale for why this question matters.",
    ].join("\n"),
    text: {
      format: zodTextFormat(personalizedQuestionListSchema, "personalized_questions"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return personalized questions.");
  }

  return response.output_parsed;
}
