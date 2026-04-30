import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { DEFAULT_OPENAI_MODEL, getRequiredEnv } from "@/lib/env";
import {
  followUpQuestionListSchema,
  personalizedQuestionListSchema,
  starRewriteSchema,
  starFeedbackSchema,
  type FollowUpQuestionList,
  type PersonalizedQuestionList,
  type STARFeedback,
} from "@/lib/schemas";

let client: OpenAI | null = null;

const STAR_RUBRIC = [
  "Use the full 1-10 range and do not default to middle scores.",
  "9-10 means highly specific, clear ownership, strong STAR structure, and measurable results.",
  "7-8 means solid STAR structure with good detail, but still missing some precision, depth, or quantified impact.",
  "5-6 means understandable but incomplete, with vague ownership, weak metrics, or partial STAR coverage.",
  "3-4 means major clarity or structure problems, little ownership, and little evidence of impact.",
  "1-2 means severely incomplete, generic, or off-prompt.",
  "Do not invent facts, metrics, or outcomes.",
].join(" ");

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
  const originalResponse = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert behavioral interview coach.",
      "Evaluate the candidate using the STAR framework: Situation, Task, Action, Result.",
      STAR_RUBRIC,
      "Be specific, direct, and constructive.",
      jobRole ? `Calibrate feedback for a ${jobRole} role.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      `Interview question: ${question}`,
      `Candidate answer: ${answer}`,
      "Return STAR component scores, actionable feedback, an overall summary, strengths, weaknesses, and high-value keywords used or missing.",
    ].join("\n\n"),
    text: {
      format: zodTextFormat(starFeedbackSchema.shape.original, "star_evaluation"),
    },
  });

  if (!originalResponse.output_parsed) {
    throw new Error("OpenAI did not return parsed STAR evaluation.");
  }

  const rewriteResponse = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert behavioral interview coach.",
      "Rewrite the candidate's answer to improve its STAR score without inventing facts.",
      STAR_RUBRIC,
      "Preserve only facts supported by the original answer.",
      "Improve clarity, ownership, sequencing, specificity, and result emphasis.",
      jobRole ? `Calibrate the rewrite for a ${jobRole} role.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      `Interview question: ${question}`,
      `Candidate original answer: ${answer}`,
      `Evaluation summary: ${originalResponse.output_parsed.overall.summary}`,
      `Strengths: ${originalResponse.output_parsed.overall.strengths.join("; ")}`,
      `Weaknesses: ${originalResponse.output_parsed.overall.weaknesses.join("; ")}`,
      "Return an improved answer and a short note describing what was improved.",
    ].join("\n\n"),
    text: {
      format: zodTextFormat(starRewriteSchema, "star_rewrite"),
    },
  });

  if (!rewriteResponse.output_parsed) {
    throw new Error("OpenAI did not return a rewritten answer.");
  }

  const revisedResponse = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert behavioral interview coach.",
      "Evaluate the rewritten answer using the exact same STAR rubric.",
      STAR_RUBRIC,
      "Be honest about whether the rewrite actually improved the answer.",
      jobRole ? `Calibrate feedback for a ${jobRole} role.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      `Interview question: ${question}`,
      `Rewritten candidate answer: ${rewriteResponse.output_parsed.improvedAnswer}`,
      "Return STAR component scores, actionable feedback, an overall summary, strengths, weaknesses, and high-value keywords used or missing.",
    ].join("\n\n"),
    text: {
      format: zodTextFormat(starFeedbackSchema.shape.revised, "revised_star_evaluation"),
    },
  });

  if (!revisedResponse.output_parsed) {
    throw new Error("OpenAI did not return a revised STAR evaluation.");
  }

  return {
    original: originalResponse.output_parsed,
    rewrite: rewriteResponse.output_parsed,
    revised: revisedResponse.output_parsed,
  };
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

export async function generateFollowUpQuestions(
  originalQuestion: string,
  candidateAnswer: string,
  profileText?: string,
  profileRole?: string,
  sessionRole?: string,
): Promise<FollowUpQuestionList> {
  const response = await getClient().responses.parse({
    model: DEFAULT_OPENAI_MODEL,
    instructions: [
      "You are an expert interviewer running a behavioral interview.",
      "Generate concise, realistic follow-up questions based on the candidate's answer.",
      "The questions should probe for missing detail, sharper ownership, clearer metrics, tradeoffs, or stronger reflection.",
      "Avoid generic repetition of the original prompt.",
      "Return only 2 or 3 strong follow-up options, not a long list.",
      profileRole ? `The saved target role is ${profileRole}.` : "",
      sessionRole ? `The active session target role is ${sessionRole}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    input: [
      `Original interview question: ${originalQuestion}`,
      `Candidate answer: ${candidateAnswer}`,
      profileText ? `Candidate background context:\n${profileText}` : "",
      "",
      "Return a small set of follow-up questions. Each item must include a category, the follow-up question text, and a short rationale.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    text: {
      format: zodTextFormat(followUpQuestionListSchema, "follow_up_questions"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return follow-up questions.");
  }

  return response.output_parsed;
}
