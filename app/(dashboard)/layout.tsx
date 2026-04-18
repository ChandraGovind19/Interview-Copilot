import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  return (
    <div className="min-h-screen pb-12 pt-6 sm:pt-8">
      <div className="page-shell min-h-screen gap-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-border/70 bg-background/82 px-5 py-4 shadow-[0_28px_65px_-45px_rgba(35,48,79,0.2)] backdrop-blur dark:bg-card/72 dark:shadow-[0_26px_70px_-44px_rgba(0,0,0,0.58)]">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              IC
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Interview Copilot</p>
              <p className="text-sm text-muted-foreground">Structured practice and feedback</p>
            </div>
          </div>
                  <div className="flex items-center gap-5 text-sm text-muted-foreground">
                    <Link href="/dashboard" className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/practice" className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">
                      Practice
                    </Link>
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
