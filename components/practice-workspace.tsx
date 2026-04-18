"use client";

import { useMemo, useState } from "react";

import { FeedbackCard } from "@/components/feedback-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_BANK } from "@/lib/question-bank";
import type { ApiFeedbackResponse, FeedbackRow } from "@/lib/types";

interface PracticeWorkspaceProps {
  isOpenAIConfigured: boolean;
  isSupabaseConfigured: boolean;
}

export function PracticeWorkspace({
  isOpenAIConfigured,
  isSupabaseConfigured,
}: PracticeWorkspaceProps) {
  const [sessionTitle, setSessionTitle] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionAnswerCount, setSessionAnswerCount] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTION_BANK[0]);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackRow | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    return answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  }, [answerText]);

  const progressValue = Math.min((sessionAnswerCount / 5) * 100, 100);
  const isConfigured = isOpenAIConfigured && isSupabaseConfigured;

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

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create a practice session.");
      }

      setSessionId(data.id);
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create session.");
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    setError(null);
    setFeedback(null);

    if (!sessionId) {
      setError("Create a session before requesting feedback.");
      return;
    }

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
          sessionId,
          question: selectedQuestion.question,
          questionCategory: selectedQuestion.category,
          answerText: answerText.trim(),
          jobRole: jobRole.trim() || undefined,
        }),
      });

      const data = (await response.json()) as ApiFeedbackResponse & { error?: string };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error ?? "Unable to generate feedback.");
      }

      setFeedback(data.feedback);
      setSessionAnswerCount((count) => count + 1);
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
            <p className="section-kicker">Practice workspace</p>
            <h1 className="text-5xl leading-none text-foreground sm:text-6xl">
              Turn one interview story into a stronger answer.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Build a session, choose a prompt, and let the STAR feedback show where the answer
              still feels vague, under-scoped, or unconvincing.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="surface-subtle p-5">
              <p className="metric-label">Current question</p>
              <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                {selectedQuestion.category}
              </p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Answers this session</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{sessionAnswerCount}</p>
            </div>
            <div className="surface-subtle p-5">
              <p className="metric-label">Progress</p>
              <div className="mt-3 space-y-2">
                <Progress value={progressValue} />
                <p className="text-sm text-muted-foreground">{Math.round(progressValue)}% of a five-answer loop</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Session setup</CardTitle>
              <CardDescription>
                Name the session and optionally set the role you are practicing for.
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
                {sessionLoading ? "Creating session..." : sessionId ? "Session ready" : "Create session"}
              </Button>
              {!isConfigured ? (
                <p className="text-sm leading-7 text-amber-700">
                  Add the OpenAI and Supabase environment variables before testing the live loop.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Question bank</CardTitle>
              <CardDescription>
                Choose one story-friendly prompt and stay with it until the answer feels complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {QUESTION_BANK.map((item) => {
                const isSelected = item.question === selectedQuestion.question;

                return (
                          <button
                            key={item.question}
                            type="button"
                            onClick={() => setSelectedQuestion(item)}
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
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="surface-soft border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-4xl leading-tight text-foreground">
                {selectedQuestion.question}
              </CardTitle>
              <CardDescription>
                Write in first person. A stronger answer names the stakes, your direct actions,
                and a result that sounds measurable instead of generic.
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
                <Button onClick={handleSubmitAnswer} disabled={!sessionId || feedbackLoading || !isConfigured}>
                  {feedbackLoading ? "Generating feedback..." : "Get AI feedback"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnswerText("");
                    setFeedback(null);
                    setError(null);
                  }}
                >
                  Clear draft
                </Button>
              </div>
              {error ? <p className="text-sm leading-7 text-red-700">{error}</p> : null}
            </CardContent>
          </Card>

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

          {feedback ? <FeedbackCard feedback={feedback} /> : null}
        </section>
      </div>
    </div>
  );
}
