import { PracticeWorkspace } from "@/components/practice-workspace";
import { hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";

export default function PracticePage() {
  return (
    <main>
      <PracticeWorkspace
        isOpenAIConfigured={hasOpenAIEnv()}
        isSupabaseConfigured={hasSupabaseEnv()}
      />
    </main>
  );
}
