import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { SessionSummary } from "@/lib/types";

interface SessionHistoryListProps {
  sessions: SessionSummary[];
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
  return (
    <Card className="surface-soft border-border/70 shadow-none">
      <CardHeader>
        <CardTitle className="text-4xl text-foreground">Session history</CardTitle>
        <CardDescription>
          Recent sessions stay visible here so you can compare cadence, answer volume, and average
          score without digging through a dense dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="surface-subtle grid gap-4 p-5 sm:grid-cols-[minmax(0,1.2fr)_160px_150px_auto] sm:items-center"
              >
                <div>
                  <p className="text-lg font-semibold text-foreground">{session.title}</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {session.jobRole ?? "No role specified"}
                  </p>
                </div>
                <div>
                  <p className="metric-label">Created</p>
                  <p className="mt-2 text-sm text-foreground">{formatSessionDate(session.createdAt)}</p>
                </div>
                <div className="sm:text-right">
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
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-border/80 bg-background/55 px-5 py-10 text-sm leading-7 text-muted-foreground dark:bg-card/45">
                    No sessions yet. Start a practice session and the history view will fill in here.
                  </div>
                )}
              </CardContent>
            </Card>
  );
}
