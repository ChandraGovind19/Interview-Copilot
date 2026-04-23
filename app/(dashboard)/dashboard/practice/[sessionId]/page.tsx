import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { PracticeWorkspace } from "@/components/practice-workspace";
import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getSessionDetailForUser } from "@/lib/supabase";

export default async function SessionPracticePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId } = await auth();
  const { sessionId } = await params;

  if (!userId || !hasSupabaseEnv()) {
    notFound();
  }

  const session = await getSessionDetailForUser(sessionId, userId);

  if (!session) {
    notFound();
  }

  return (
    <main>
      <PracticeWorkspace
        isOpenAIConfigured={hasOpenAIEnv()}
        isSupabaseConfigured={hasSupabaseEnv()}
        initialSession={session}
      />
    </main>
  );
}
