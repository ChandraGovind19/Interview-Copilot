"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { FeedbackCard } from "@/components/feedback-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_BANK } from "@/lib/question-bank";
import type {
  ApiFeedbackResponse,
  FeedbackRow,
  PersonalizedQuestion,
  SessionAnswerHistory,
  SessionDetail,
  SessionSummary,
} from "@/lib/types";

interface PracticeWorkspaceProps {
  isOpenAIConfigured: boolean;
  isSupabaseConfigured: boolean;
  hasExperienceProfile?: boolean;
  sessions?: SessionSummary[];
  initialSession?: SessionDetail | null;
}

interface PracticeQuestion {
  category: string;
  question: string;
  source: "bank" | "custom" | "personalized";
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatAnswerDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function scrollToSection(element: HTMLElement | null) {
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SessionHub({
  isConfigured,
  sessions,
}: {
  isConfigured: boolean;
  sessions: SessionSummary[];
}) {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSession() {
    setError(null);

    if (!sessionTitle.trim()) {
      setError("Add a session title before continuing.");
      return;
    }

    setSessionLoading(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle.trim(),
          jobRole: jobRole.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "Unable to create a practice session.");
      }

      router.push(`/dashboard/practice/${data.id}`);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create session.");
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-soft overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <p className="section-kicker">Practice hub</p>
            <h1 className="text-5xl leading-none text-foreground sm:text-6xl">
              Start a session or jump back into an old one.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Sessions are now the top-level workflow. Create one for a role or interview loop,
              then reopen it anytime to keep your answers, scores, and feedback together.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="surface-subtle p-5">
              <p className="metric-label">Saved sessions</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{sessions.length}</p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Answered sessions</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {sessions.filter((session) => session.answerCount > 0).length}
              </p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Latest activity</p>
              <p className="mt-3 text-base font-semibold text-foreground">
                {sessions[0] ? formatSessionDate(sessions[0].createdAt) : "No activity yet"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Create session</CardTitle>
              <CardDescription>
                Start a fresh interview practice track with its own answers and feedback history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="session-title">
                  Session name
                </label>
                <Input
                  id="session-title"
                  placeholder="Behavioral prep for internship interviews"
                  value={sessionTitle}
                  onChange={(event) => setSessionTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="job-role">
                  Target role
                </label>
                <Input
                  id="job-role"
                  placeholder="Software Engineering Intern at Google"
                  value={jobRole}
                  onChange={(event) => setJobRole(event.target.value)}
                />
              </div>
              <Button onClick={handleCreateSession} disabled={sessionLoading || !isConfigured}>
                {sessionLoading ? "Creating session..." : "Create and open session"}
              </Button>
              {error ? <p className="text-sm leading-7 text-red-700">{error}</p> : null}
              {!isConfigured ? (
                <p className="text-sm leading-7 text-amber-700">
                  Add the OpenAI and Supabase environment variables before testing the live loop.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-4xl leading-tight text-foreground">
                Continue an existing session
              </CardTitle>
              <CardDescription>
                Reopen any prior session to review earlier answers and continue working in the same
                track.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="surface-subtle grid gap-4 p-5 sm:grid-cols-[minmax(0,1.25fr)_140px_150px_auto] sm:items-center"
                    >
                      <div>
                        <p className="text-lg font-semibold text-foreground">{session.title}</p>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {session.jobRole ?? "No role specified"}
                        </p>
                      </div>
                      <div>
                        <p className="metric-label">Created</p>
                        <p className="mt-2 text-sm text-foreground">
                          {formatSessionDate(session.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="metric-label">Summary</p>
                        <p className="mt-2 text-sm text-foreground">{session.answerCount} answers</p>
                        <p className="text-sm text-muted-foreground">
                          {session.avgScore ? `Avg ${session.avgScore}/10` : "No scores yet"}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <Link
                          href={`/dashboard/practice/${session.id}`}
                          className={buttonVariants({ variant: "outline" })}
                        >
                          Open session
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-background/55 px-5 py-10 text-sm leading-7 text-muted-foreground dark:bg-card/45">
                  No sessions yet. Create one on the left and it will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function SessionHistory({
  answers,
  onReuseQuestion,
  onReviewFeedback,
}: {
  answers: SessionAnswerHistory[];
  onReuseQuestion: (question: string, category: string | null) => void;
  onReviewFeedback: (feedback: FeedbackRow | null) => void;
}) {
  if (!answers.length) {
    return (
      <Card className="surface-soft border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Session history</CardTitle>
          <CardDescription>
            Your prior questions, answers, and scores will appear here after the first feedback
            run.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="surface-soft border-border/70 shadow-none">
      <CardHeader>
        <CardTitle>Session history</CardTitle>
        <CardDescription>
          Every feedback run stays attached to this session so you can compare questions, scores,
          and revisions over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {answers.map((answer) => (
          <div key={answer.id} className="surface-subtle space-y-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="metric-label">{answer.questionCategory ?? "Practice question"}</p>
                <p className="text-lg font-semibold leading-8 text-foreground">{answer.question}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatAnswerDate(answer.createdAt)}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <div>
                  <p className="metric-label">Your answer</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{answer.answerText}</p>
                </div>
                <div>
                  <p className="metric-label">Result</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {answer.feedback?.overallSummary ?? "No summary available"}
                  </p>
                </div>
              </div>
              <div className="rounded-[22px] border border-border/60 bg-background/65 p-4 dark:bg-card/40">
                <p className="metric-label">Score breakdown</p>
                {answer.feedback ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-background/75 px-3 py-3 dark:bg-background/25">
                      <p className="metric-label">Overall</p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {answer.feedback.overallScore}/10
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background/75 px-3 py-3 dark:bg-background/25">
                      <p className="metric-label">Situation</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {answer.feedback.situationScore}/10
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background/75 px-3 py-3 dark:bg-background/25">
                      <p className="metric-label">Task</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {answer.feedback.taskScore}/10
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background/75 px-3 py-3 dark:bg-background/25">
                      <p className="metric-label">Action</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {answer.feedback.actionScore}/10
                      </p>
                    </div>
                    <div className="rounded-2xl bg-background/75 px-3 py-3 dark:bg-background/25">
                      <p className="metric-label">Result</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {answer.feedback.resultScore}/10
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Feedback pending.</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-border/80 bg-background/80 shadow-sm hover:border-primary/30 dark:border-border dark:bg-background/20"
                  onClick={() => onReuseQuestion(answer.question, answer.questionCategory)}
                >
                  Reuse question
                </Button>
                <Button
                  variant="outline"
                  className="border-border/80 bg-background/80 shadow-sm hover:border-primary/30 dark:border-border dark:bg-background/20"
                  onClick={() => onReviewFeedback(answer.feedback)}
                  disabled={!answer.feedback}
                >
                  Review full feedback
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SessionWorkspace({
  session,
  isConfigured,
  hasExperienceProfile,
}: {
  session: SessionDetail;
  isConfigured: boolean;
  hasExperienceProfile: boolean;
}) {
  const router = useRouter();
  const [sessionMeta, setSessionMeta] = useState({
    title: session.title,
    jobRole: session.jobRole ?? "",
  });
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion>(() => {
    const matchingQuestion = QUESTION_BANK.find(
      (item) => item.question === session.answers[0]?.question,
    );

    if (matchingQuestion) {
      return { ...matchingQuestion, source: "bank" };
    }

    if (session.answers[0]?.question) {
      return {
        category: session.answers[0].questionCategory ?? "Custom question",
        question: session.answers[0].question,
        source: "custom",
      };
    }

    return { ...QUESTION_BANK[0], source: "bank" };
  });
  const [customQuestionCategory, setCustomQuestionCategory] = useState("Custom question");
  const [customQuestionText, setCustomQuestionText] = useState("");
  const [personalizedQuestions, setPersonalizedQuestions] = useState<PersonalizedQuestion[]>([]);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [personalizedError, setPersonalizedError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackRow | null>(session.answers[0]?.feedback ?? null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [sessionDeleting, setSessionDeleting] = useState(false);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerHistory, setAnswerHistory] = useState<SessionAnswerHistory[]>(session.answers);
  const answerEditorRef = useRef<HTMLDivElement | null>(null);
  const feedbackPanelRef = useRef<HTMLDivElement | null>(null);

  const wordCount = useMemo(() => {
    return answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  }, [answerText]);

  const progressValue = Math.min((answerHistory.length / 5) * 100, 100);
  const averageScore = useMemo(() => {
    const scores = answerHistory
      .map((answer) => answer.feedback?.overallScore ?? null)
      .filter((score): score is number => typeof score === "number");

    if (!scores.length) {
      return null;
    }

    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
  }, [answerHistory]);

  const selectedQuestionSource = useMemo(() => {
    return selectedQuestion.source === "bank"
      ? "Question bank"
      : selectedQuestion.source === "personalized"
        ? "Personalized"
        : "Custom question";
  }, [selectedQuestion]);

  function reuseQuestion(question: string, category: string | null) {
    const matchingQuestion = QUESTION_BANK.find((item) => item.question === question);

    if (matchingQuestion) {
      setSelectedQuestion({ ...matchingQuestion, source: "bank" });
    } else {
      setSelectedQuestion({
        category: category ?? "Practice",
        question,
        source: "custom",
      });
    }

    scrollToSection(answerEditorRef.current);
  }

  function useCustomQuestion() {
    setError(null);

    if (!customQuestionText.trim()) {
      setError("Add a custom question before selecting it.");
      return;
    }

    setSelectedQuestion({
      category: customQuestionCategory.trim() || "Custom question",
      question: customQuestionText.trim(),
      source: "custom",
    });

    scrollToSection(answerEditorRef.current);
  }

  async function handleGeneratePersonalizedQuestions() {
    setPersonalizedError(null);
    setPersonalizedLoading(true);

    try {
      const response = await fetch("/api/questions/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionRole: sessionMeta.jobRole.trim() || undefined,
        }),
      });

      const data = (await response.json()) as { questions?: PersonalizedQuestion[]; error?: string };

      if (!response.ok || !data.questions) {
        throw new Error(data.error ?? "Unable to generate personalized questions.");
      }

      setPersonalizedQuestions(data.questions);

      if (data.questions[0]) {
        setSelectedQuestion({
          category: data.questions[0].category,
          question: data.questions[0].question,
          source: "personalized",
        });
      }
    } catch (generationError) {
      setPersonalizedError(
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate personalized questions.",
      );
    } finally {
      setPersonalizedLoading(false);
    }
  }

  function reviewFeedback(nextFeedback: FeedbackRow | null) {
    setFeedback(nextFeedback);
    scrollToSection(feedbackPanelRef.current);
  }

  async function handleSaveSession() {
    setError(null);

    if (!sessionMeta.title.trim()) {
      setError("Add a session title before saving.");
      return;
    }

    setSessionSaving(true);

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionMeta.title.trim(),
          jobRole: sessionMeta.jobRole.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update this session.");
      }

      setSessionMeta({
        title: data.title,
        jobRole: data.job_role ?? "",
      });

      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update this session.");
    } finally {
      setSessionSaving(false);
    }
  }

  async function handleDeleteSession() {
    setError(null);
    setSessionDeleting(true);

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete this session.");
      }

      setDeletePromptOpen(false);
      router.push("/dashboard/practice");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete this session.",
      );
      setSessionDeleting(false);
    }
  }

  async function handleSubmitAnswer() {
    setError(null);
    setFeedback(null);

    if (!answerText.trim()) {
      setError("Add an answer before requesting feedback.");
      return;
    }

    setFeedbackLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          question: selectedQuestion.question,
          questionCategory: selectedQuestion.category,
          answerText: answerText.trim(),
          jobRole: sessionMeta.jobRole.trim() || undefined,
        }),
      });

      const data = (await response.json()) as ApiFeedbackResponse & { error?: string };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error ?? "Unable to generate feedback.");
      }

      const newHistoryItem: SessionAnswerHistory = {
        id: data.answer.id,
        question: data.answer.question,
        questionCategory: data.answer.question_category,
        answerText: data.answer.answer_text,
        createdAt: data.answer.created_at,
        feedback: data.feedback,
      };

      setFeedback(data.feedback);
      setAnswerHistory((current) => [newHistoryItem, ...current]);
      setAnswerText("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="surface-soft overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <p className="section-kicker">Active session</p>
            <h1 className="text-5xl leading-none text-foreground sm:text-6xl">
              {sessionMeta.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Keep practicing inside one session so the questions, answers, and STAR feedback stay
              grouped together.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/practice"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Back to session hub
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="surface-subtle p-5">
              <p className="metric-label">Target role</p>
              <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                {sessionMeta.jobRole || "No role specified"}
              </p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Answers this session</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{answerHistory.length}</p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Average score</p>
              <div className="mt-3 space-y-2">
                <p className="text-3xl font-semibold text-foreground">{averageScore ?? "-"}</p>
                <Progress value={progressValue} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Session settings</CardTitle>
              <CardDescription>
                Keep the active session organized and clean up old sessions when they are no
                longer useful.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="active-session-title">
                  Session name
                </label>
                <Input
                  id="active-session-title"
                  value={sessionMeta.title}
                  onChange={(event) =>
                    setSessionMeta((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="active-job-role">
                  Target role
                </label>
                <Input
                  id="active-job-role"
                  value={sessionMeta.jobRole}
                  onChange={(event) =>
                    setSessionMeta((current) => ({ ...current, jobRole: event.target.value }))
                  }
                />
              </div>
              <div className="rounded-[22px] border border-border/60 bg-background/55 p-4 text-sm dark:bg-card/40">
                <p className="metric-label">Created</p>
                <p className="mt-2 font-medium text-foreground">
                  {formatSessionDate(session.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveSession} disabled={sessionSaving || sessionDeleting}>
                  {sessionSaving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeletePromptOpen(true)}
                  disabled={sessionDeleting || sessionSaving}
                >
                  {sessionDeleting ? "Deleting..." : "Delete session"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Question bank</CardTitle>
              <CardDescription>
                Select a prompt for the next answer, or write your own if you want to practice a
                real interview question.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {QUESTION_BANK.map((item) => {
                const isSelected = item.question === selectedQuestion.question;

                return (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => setSelectedQuestion({ ...item, source: "bank" })}
                    className={[
                      "w-full rounded-[22px] border px-4 py-4 text-left transition-all",
                      isSelected
                        ? "border-primary/25 bg-primary/8 shadow-[0_16px_40px_-28px_rgba(79,104,184,0.5)] dark:border-primary/30 dark:bg-primary/12"
                        : "border-border/70 bg-background/55 hover:border-primary/20 hover:bg-background/75 dark:bg-card/40 dark:hover:bg-card/62",
                    ].join(" ")}
                  >
                    <p className="metric-label">{item.category}</p>
                    <p className="mt-2 text-sm leading-7 text-foreground">{item.question}</p>
                  </button>
                );
              })}

              <div className="space-y-4 rounded-[24px] border border-border/70 bg-background/55 p-4 dark:bg-card/45">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Custom question</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Paste a real prompt from a recruiter, application portal, or interview guide.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-foreground"
                    htmlFor="custom-question-category"
                  >
                    Label
                  </label>
                  <Input
                    id="custom-question-category"
                    value={customQuestionCategory}
                    onChange={(event) => setCustomQuestionCategory(event.target.value)}
                    placeholder="Custom question"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-foreground"
                    htmlFor="custom-question-text"
                  >
                    Question text
                  </label>
                  <Textarea
                    id="custom-question-text"
                    rows={5}
                    value={customQuestionText}
                    onChange={(event) => setCustomQuestionText(event.target.value)}
                    placeholder="Paste your custom interview question here..."
                    className="bg-white/70"
                  />
                </div>

                <Button
                  variant="outline"
                  className="border-border/80 bg-background/80 shadow-sm hover:border-primary/30 dark:border-border dark:bg-background/20"
                  onClick={useCustomQuestion}
                >
                  Use custom question
                </Button>
              </div>

              <div className="space-y-4 rounded-[24px] border border-border/70 bg-background/55 p-4 dark:bg-card/45">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Personalized questions</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Generate interview questions from the saved experience profile and the active
                    role.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="border-border/80 bg-background/80 shadow-sm hover:border-primary/30 dark:border-border dark:bg-background/20"
                  onClick={handleGeneratePersonalizedQuestions}
                  disabled={personalizedLoading || !isConfigured || !hasExperienceProfile}
                >
                  {personalizedLoading ? "Generating questions..." : "Generate personalized questions"}
                </Button>

                {!hasExperienceProfile ? (
                  <p className="text-sm leading-7 text-muted-foreground">
                    Save an experience profile on the dashboard first to unlock personalized
                    questions.
                  </p>
                ) : null}

                {personalizedError ? (
                  <p className="text-sm leading-7 text-red-700">{personalizedError}</p>
                ) : null}

                {personalizedQuestions.length ? (
                  <div className="space-y-3">
                    {personalizedQuestions.map((item) => {
                      const isSelected =
                        item.question === selectedQuestion.question &&
                        selectedQuestion.source === "personalized";

                      return (
                        <button
                          key={`${item.category}-${item.question}`}
                          type="button"
                          onClick={() =>
                            setSelectedQuestion({
                              category: item.category,
                              question: item.question,
                              source: "personalized",
                            })
                          }
                          className={[
                            "w-full rounded-[22px] border px-4 py-4 text-left transition-all",
                            isSelected
                              ? "border-primary/25 bg-primary/8 shadow-[0_16px_40px_-28px_rgba(79,104,184,0.5)] dark:border-primary/30 dark:bg-primary/12"
                              : "border-border/70 bg-background/55 hover:border-primary/20 hover:bg-background/75 dark:bg-card/40 dark:hover:bg-card/62",
                          ].join(" ")}
                        >
                          <p className="metric-label">{item.category}</p>
                          <p className="mt-2 text-sm leading-7 text-foreground">{item.question}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {item.rationale}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div ref={answerEditorRef}>
            <Card className="surface-soft border-border/70 shadow-none">
              <CardHeader>
              <CardTitle className="text-4xl leading-tight text-foreground">
                {selectedQuestion.question}
              </CardTitle>
              <CardDescription>
                <span className="font-medium text-foreground">{selectedQuestionSource}</span>
                {" · "}
                {selectedQuestion.category}
                {" · "}Write in first person. A stronger answer names the stakes, your direct
                actions, and a result that sounds measurable instead of generic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                rows={14}
                placeholder="Type your interview answer here..."
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                className="min-h-[320px] bg-white/70"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Word count: {wordCount}</span>
                <span>Best range: 150-300 words</span>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSubmitAnswer} disabled={feedbackLoading || !isConfigured}>
                  {feedbackLoading ? "Generating feedback..." : "Get AI feedback"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnswerText("");
                    setError(null);
                  }}
                >
                  Clear draft
                </Button>
              </div>
              {error ? <p className="text-sm leading-7 text-red-700">{error}</p> : null}
              {!isConfigured ? (
                <p className="text-sm leading-7 text-amber-700">
                  Add the OpenAI and Supabase environment variables before testing the live loop.
                </p>
              ) : null}
              </CardContent>
            </Card>
          </div>

          {feedbackLoading ? (
            <Card className="surface-soft border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Generating feedback</CardTitle>
                <CardDescription>
                  Saving the answer and generating STAR coaching now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-24 w-full rounded-[22px]" />
                <Skeleton className="h-24 w-full rounded-[22px]" />
                <Skeleton className="h-24 w-full rounded-[22px]" />
              </CardContent>
            </Card>
          ) : null}

          {feedback ? (
            <div ref={feedbackPanelRef}>
              <FeedbackCard feedback={feedback} />
            </div>
          ) : null}

          <SessionHistory
            answers={answerHistory}
            onReuseQuestion={reuseQuestion}
            onReviewFeedback={reviewFeedback}
          />
        </section>
      </div>

      {deletePromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <Card className="surface-soft w-full max-w-lg border-border/80 shadow-[0_32px_90px_-48px_rgba(0,0,0,0.65)]">
            <CardHeader>
              <CardTitle>Delete this session?</CardTitle>
              <CardDescription>
                This removes the session and all saved answers and feedback tied to it. This
                action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[22px] border border-border/70 bg-background/60 p-4 text-sm dark:bg-card/45">
                <p className="font-semibold text-foreground">{sessionMeta.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {answerHistory.length} saved {answerHistory.length === 1 ? "answer" : "answers"}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-border/80 bg-background/80 shadow-sm hover:border-primary/30 dark:border-border dark:bg-background/20"
                  onClick={() => setDeletePromptOpen(false)}
                  disabled={sessionDeleting}
                >
                  Cancel
                </Button>
                <Button onClick={handleDeleteSession} disabled={sessionDeleting}>
                  {sessionDeleting ? "Deleting..." : "Delete permanently"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export function PracticeWorkspace({
  isOpenAIConfigured,
  isSupabaseConfigured,
  hasExperienceProfile = false,
  sessions = [],
  initialSession = null,
}: PracticeWorkspaceProps) {
  const isConfigured = isOpenAIConfigured && isSupabaseConfigured;

  if (initialSession) {
    return (
      <SessionWorkspace
        session={initialSession}
        isConfigured={isConfigured}
        hasExperienceProfile={hasExperienceProfile}
      />
    );
  }

  return <SessionHub isConfigured={isConfigured} sessions={sessions} />;
}
