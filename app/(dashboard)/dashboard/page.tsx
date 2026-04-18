import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

import { SessionHistoryList } from "@/components/session-history-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/env";
import { getDashboardSnapshot } from "@/lib/supabase";

const statConfig = [
  { key: "totalSessions", label: "Sessions created" },
  { key: "totalAnswers", label: "Answers reviewed" },
  { key: "averageScore", label: "Average STAR score" },
] as const;

export default async function DashboardPage() {
  const user = await currentUser();
  const userId = user?.id;
  const dashboard = userId && hasSupabaseEnv() ? await getDashboardSnapshot(userId) : null;
  const displayName = user?.firstName ?? user?.username ?? "there";

  const stats = {
    totalSessions: dashboard?.stats.totalSessions ?? 0,
    totalAnswers: dashboard?.stats.totalAnswers ?? 0,
    averageScore: dashboard?.stats.averageScore ?? "-",
  };

  return (
    <main className="flex flex-col gap-8">
      <section className="surface-soft overflow-hidden p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <p className="section-kicker">Dashboard</p>
            <div className="space-y-4">
              <h1 className="text-5xl leading-none text-foreground sm:text-6xl">
                Welcome back, {displayName}.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This workspace keeps the current build focused on one thing: turning rough
                interview stories into structured answers you can improve session by session.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/practice" className={buttonVariants({ size: "lg" })}>
                Start a new practice session
              </Link>
              <Link href="/" className={buttonVariants({ size: "lg", variant: "outline" })}>
                View landing page
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {statConfig.map((item) => (
              <div key={item.key} className="surface-subtle p-5">
                <p className="metric-label">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {stats[item.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!hasSupabaseEnv() ? (
        <Card className="border-amber-300/70 bg-amber-50/90">
          <CardHeader>
            <CardTitle>Supabase is not configured yet</CardTitle>
            <CardDescription>
              The visual layer is ready, but session persistence will remain empty until the
              Supabase keys are configured and the schema is applied.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Add Supabase keys to unlock history
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <SessionHistoryList sessions={dashboard?.sessions ?? []} />
    </main>
  );
}
