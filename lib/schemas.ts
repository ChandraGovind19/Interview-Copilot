import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().trim().min(3, "Session title is too short.").max(120),
  jobRole: z.string().trim().max(160).optional(),
});

export const feedbackRequestSchema = z.object({
  sessionId: z.string().uuid("Session id must be a valid UUID."),
  question: z.string().trim().min(10),
  questionCategory: z.string().trim().min(2).max(60),
  answerText: z.string().trim().min(40, "Answer is too short for useful feedback.").max(5000),
  jobRole: z.string().trim().max(160).optional(),
});

const scoreSchema = z.number().int().min(1).max(10);

export const starFeedbackSchema = z.object({
  situation: z.object({
    score: scoreSchema,
    feedback: z.string().trim().min(1),
  }),
  task: z.object({
    score: scoreSchema,
    feedback: z.string().trim().min(1),
  }),
  action: z.object({
    score: scoreSchema,
    feedback: z.string().trim().min(1),
  }),
  result: z.object({
    score: scoreSchema,
    feedback: z.string().trim().min(1),
  }),
  overall: z.object({
    score: scoreSchema,
    summary: z.string().trim().min(1),
    strengths: z.array(z.string().trim().min(1)).min(2).max(4),
    weaknesses: z.array(z.string().trim().min(1)).min(2).max(4),
    improvedAnswer: z.string().trim().min(80),
    keywordsUsed: z.array(z.string().trim().min(1)).max(6),
    keywordsMissing: z.array(z.string().trim().min(1)).max(6),
  }),
});

export type STARFeedback = z.infer<typeof starFeedbackSchema>;
