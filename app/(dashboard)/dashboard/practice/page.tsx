import { PracticeWorkspace } from "@/components/practice-workspace";
import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getSessionsForUser } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export default async function PracticePage() {
  const { userId } = await auth();
  const sessions = userId && hasSupabaseEnv() ? await getSessionsForUser(userId) : [];

  return (
    <main>
      <PracticeWorkspace
        isOpenAIConfigured={hasOpenAIEnv()}
        isSupabaseConfigured={hasSupabaseEnv()}
        sessions={sessions}
      />
    </main>
  );
}
