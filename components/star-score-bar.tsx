import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StarScoreBarProps {
  label: string;
  score: number;
  feedback: string;
}

export function StarScoreBar({ label, score, feedback }: StarScoreBarProps) {
  const progressValue = Math.max(0, Math.min(score * 10, 100));

  return (
    <Card size="sm" className="surface-subtle border-border/70 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="metric-label">{label}</p>
            <CardTitle className="mt-2 text-2xl text-foreground">{score}/10</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressValue} />
        <p className="text-sm leading-7 text-muted-foreground">{feedback}</p>
      </CardContent>
    </Card>
  );
}
