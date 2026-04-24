import { PracticeWorkspace } from "@/components/practice-workspace";
import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getExperienceProfileForUser, getSessionsForUser } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export default async function PracticePage() {
  const { userId } = await auth();
  const sessions = userId && hasSupabaseEnv() ? await getSessionsForUser(userId) : [];
  const experienceProfile =
    userId && hasSupabaseEnv() ? await getExperienceProfileForUser(userId) : null;

  return (
    <main>
      <PracticeWorkspace
        isOpenAIConfigured={hasOpenAIEnv()}
        isSupabaseConfigured={hasSupabaseEnv()}
        hasExperienceProfile={Boolean(experienceProfile)}
        sessions={sessions}
      />
    </main>
  );
}
