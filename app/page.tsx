import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <main className="min-h-screen pb-16 pt-8 sm:pt-10">
      <div className="page-shell gap-16">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-border/70 bg-background/80 px-5 py-3 shadow-[0_20px_40px_-32px_rgba(35,48,79,0.18)] backdrop-blur dark:bg-card/70 dark:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              IC
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Interview Copilot</p>
              <p className="text-sm text-muted-foreground">Practice behavioral answers with structure</p>
            </div>
          </div>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                      <Button variant="ghost">Sign in</Button>
                    </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              <Button>Start free</Button>
            </SignUpButton>
          </div>
        </header>

        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-end">
          <div className="flex flex-col gap-8">
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

            <div className="flex flex-wrap items-center gap-3">
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                <Button size="lg">Create a practice session</Button>
              </SignUpButton>
              <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline" })}>
                View the workspace
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-primary/70" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-soft overflow-hidden p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Session preview</p>
                <h2 className="mt-2 text-3xl text-foreground">A cleaner way to practice</h2>
              </div>
              <div className="rounded-full border border-border/80 bg-white/80 px-3 py-1 text-sm text-muted-foreground">
                Behavioral loop
              </div>
            </div>

            <div className="mt-10 grid gap-6">
              {workflow.map((item, index) => (
                <div key={item.title} className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:items-start">
                  <div className="flex size-14 items-center justify-center rounded-full border border-border/80 bg-white/85 text-sm font-semibold text-foreground">
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

        <section className="surface-subtle grid gap-8 p-8 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="section-kicker">What changes in this version</p>
            <h2 className="text-4xl text-foreground">Less dashboard clutter, more readable feedback.</h2>
            <p className="text-base leading-8 text-muted-foreground">
              The experience is now designed like a writing workspace: calm structure, softer
              surfaces, room for long-form answers, and feedback blocks that are easier to scan.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="metric-label">Palette</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Warm neutrals with one slate-blue accent instead of high-contrast dark mode.
                </p>
              </div>
              <div>
                <p className="metric-label">Typography</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Fraunces for hierarchy and Manrope for body copy to separate reading modes.
                </p>
              </div>
              <div>
                <p className="metric-label">Layout</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  A clearer split between session controls, writing space, and coaching output.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                <Button>Create your first session</Button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                <Button variant="outline">Use an existing account</Button>
              </SignInButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
