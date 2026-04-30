import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().trim().min(3, "Session title is too short.").max(120),
  jobRole: z.string().trim().max(160).optional(),
});

export const updateSessionSchema = z.object({
  title: z.string().trim().min(3, "Session title is too short.").max(120),
  jobRole: z.string().trim().max(160).optional(),
});

export const experienceProfileSchema = z.object({
  title: z.string().trim().min(3, "Profile title is too short.").max(120),
  targetRole: z.string().trim().max(160).optional(),
  sourceText: z
    .string()
    .trim()
    .min(120, "Add more experience detail so the profile is useful.")
    .max(12000, "Experience profile is too long."),
});

export const personalizedQuestionSchema = z.object({
  category: z.string().trim().min(2).max(60),
  question: z.string().trim().min(10).max(300),
  rationale: z.string().trim().min(10).max(220),
});

export const personalizedQuestionListSchema = z.object({
  questions: z.array(personalizedQuestionSchema).min(6).max(12),
});

export const followUpQuestionSchema = z.object({
  category: z.string().trim().min(2).max(60),
  question: z.string().trim().min(10).max(300),
  rationale: z.string().trim().min(10).max(220),
});

export const followUpQuestionListSchema = z.object({
  questions: z.array(followUpQuestionSchema).min(1).max(3),
});

export const feedbackRequestSchema = z.object({
  sessionId: z.string().uuid("Session id must be a valid UUID."),
  question: z.string().trim().min(10),
  questionCategory: z.string().trim().min(2).max(60),
  answerText: z.string().trim().min(40, "Answer is too short for useful feedback.").max(5000),
  jobRole: z.string().trim().max(160).optional(),
});

const scoreSchema = z.number().int().min(1).max(10);

const starDimensionSchema = z.object({
  score: scoreSchema,
  feedback: z.string().trim().min(1),
});

const starEvaluationSchema = z.object({
  situation: starDimensionSchema,
  task: starDimensionSchema,
  action: starDimensionSchema,
  result: starDimensionSchema,
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

export const starRewriteSchema = z.object({
  improvedAnswer: z.string().trim().min(80),
  improvementSummary: z.string().trim().min(1),
});

export const starFeedbackSchema = z.object({
  original: starEvaluationSchema,
  rewrite: starRewriteSchema,
  revised: starEvaluationSchema,
});

export type STARFeedback = z.infer<typeof starFeedbackSchema>;
export type PersonalizedQuestionList = z.infer<typeof personalizedQuestionListSchema>;
export type FollowUpQuestionList = z.infer<typeof followUpQuestionListSchema>;
