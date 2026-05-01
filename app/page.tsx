import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const workflow = [
  {
    title: "Pick a prompt",
    detail: "Start from a behavioral question bank built for internship and new-grad prep.",
  },
  {
    title: "Draft your answer",
    detail: "Write a real story with enough detail for the model to judge structure and impact.",
  },
  {
    title: "Refine with feedback",
    detail: "See STAR scores, coaching notes, and a stronger version of your answer immediately.",
  },
];

const proofPoints = [
  "Structured STAR scoring",
  "Interview-ready rewrite suggestions",
  "Saved sessions and progress tracking",
];

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen pb-16 pt-6 sm:pt-8">
      <div className="page-shell gap-14 lg:gap-18">
        <header className="flex flex-col gap-4 rounded-[30px] border border-border/70 bg-background/82 px-5 py-4 shadow-[0_20px_48px_-34px_rgba(35,48,79,0.18)] backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:bg-card/72 dark:shadow-[0_22px_55px_-36px_rgba(0,0,0,0.58)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              IC
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Interview Copilot</p>
              <p className="text-sm text-muted-foreground">
                Practice behavioral answers with structure
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <ThemeToggle />
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
            >
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              <Button>Start free</Button>
            </SignUpButton>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-start">
          <div className="flex flex-col gap-7 pt-2">
            <div className="flex flex-col gap-5">
              <p className="section-kicker">Interview practice, redesigned for clarity</p>
              <h1 className="max-w-4xl text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
                Write sharper interview stories, then see exactly where they break down.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Interview Copilot gives every answer a clean STAR review, surfaces weak spots,
                and rewrites the response into something more precise, confident, and measurable.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {proofPoints.map((point) => (
                <div key={point} className="flex min-w-fit items-center gap-3">
                  <span className="size-2 rounded-full bg-primary/70" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-soft self-start overflow-hidden p-8 sm:p-10">
            <div>
              <p className="section-kicker">Session preview</p>
              <h2 className="mt-2 text-3xl text-foreground">A cleaner way to practice</h2>
            </div>

            <div className="mt-10 grid gap-6">
              {workflow.map((item, index) => (
                <div key={item.title} className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
                  <div className="flex size-14 items-center justify-center rounded-full border border-border/80 bg-white/85 text-sm font-semibold text-foreground dark:bg-background/30 dark:text-foreground">
                    0{index + 1}
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                    <p className="max-w-md text-sm leading-7 text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-subtle grid gap-10 p-8 sm:p-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="space-y-4">
            <p className="section-kicker">How scoring works</p>
            <h2 className="max-w-2xl text-4xl text-foreground">
              The rubric shows what changed, not just what the model thinks.
            </h2>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              Each answer is scored on Situation, Task, Action, and Result. Then the app rewrites
              the answer without adding new facts and runs the same rubric again so you can compare
              the first score to the revised estimate.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
              <div className="flex size-14 items-center justify-center rounded-full border border-border/80 bg-white/85 text-sm font-semibold text-foreground dark:bg-background/30 dark:text-foreground">
                01
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">STAR breakdown</p>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  Situation, Task, Action, and Result are scored separately so weak sections are
                  easy to spot.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
              <div className="flex size-14 items-center justify-center rounded-full border border-border/80 bg-white/85 text-sm font-semibold text-foreground dark:bg-background/30 dark:text-foreground">
                02
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Score bands</p>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  9-10 means specific and measurable, 7-8 is solid but not complete, 5-6 is partial,
                  and 1-4 means the answer is still too vague or thin.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
              <div className="flex size-14 items-center justify-center rounded-full border border-border/80 bg-white/85 text-sm font-semibold text-foreground dark:bg-background/30 dark:text-foreground">
                03
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Rewrite check</p>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  After feedback, the app rewrites the answer and scores that version again so the
                  improvement signal is explicit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
