import { StarScoreBar } from "@/components/star-score-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackRow } from "@/lib/types";

interface FeedbackCardProps {
  feedback: FeedbackRow;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <Card className="surface-soft border-border/70 shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Feedback output</p>
            <CardTitle className="text-4xl leading-none text-foreground">STAR review</CardTitle>
            <CardDescription className="max-w-2xl text-base leading-8">
              {feedback.overallSummary}
            </CardDescription>
          </div>
          <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
            <div className="surface-subtle p-4 text-right">
              <p className="metric-label">Original score</p>
              <p className="mt-3 text-4xl font-semibold text-foreground">{feedback.overallScore}/10</p>
            </div>
            <div className="surface-subtle p-4 text-right">
              <p className="metric-label">Rewrite estimate</p>
              <p className="mt-3 text-4xl font-semibold text-foreground">
                {feedback.revisedOverallScore}/10
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <StarScoreBar label="Situation" score={feedback.situationScore} feedback={feedback.situationFeedback} />
          <StarScoreBar label="Task" score={feedback.taskScore} feedback={feedback.taskFeedback} />
          <StarScoreBar label="Action" score={feedback.actionScore} feedback={feedback.actionFeedback} />
          <StarScoreBar label="Result" score={feedback.resultScore} feedback={feedback.resultFeedback} />
        </div>

        <div className="surface-subtle grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="metric-label">Rubric score change</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-border/70 bg-background/65 p-4 dark:bg-background/25">
                <p className="metric-label">Situation</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {feedback.situationScore} → {feedback.revisedSituationScore}
                </p>
              </div>
              <div className="rounded-[20px] border border-border/70 bg-background/65 p-4 dark:bg-background/25">
                <p className="metric-label">Task</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {feedback.taskScore} → {feedback.revisedTaskScore}
                </p>
              </div>
              <div className="rounded-[20px] border border-border/70 bg-background/65 p-4 dark:bg-background/25">
                <p className="metric-label">Action</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {feedback.actionScore} → {feedback.revisedActionScore}
                </p>
              </div>
              <div className="rounded-[20px] border border-border/70 bg-background/65 p-4 dark:bg-background/25">
                <p className="metric-label">Result</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {feedback.resultScore} → {feedback.revisedResultScore}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="metric-label">Why the rewrite scores differently</p>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.improvementSummary}</p>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.revisedOverallSummary}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-subtle p-5">
            <p className="metric-label">Strengths</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {feedback.strengths.map((strength) => (
                <li key={strength} className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-primary/70" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-subtle p-5">
            <p className="metric-label">Opportunities</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {feedback.weaknesses.map((weakness) => (
                <li key={weakness} className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-amber-500/80" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-subtle p-6">
          <p className="metric-label">Improved answer</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
            {feedback.improvedAnswer}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="metric-label">Keywords used</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {feedback.keywordsUsed.length ? (
                feedback.keywordsUsed.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="h-7 rounded-full px-3">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None detected.</span>
              )}
            </div>
          </div>
          <div>
            <p className="metric-label">Keywords missing</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {feedback.keywordsMissing.length ? (
                feedback.keywordsMissing.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="h-7 rounded-full px-3">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No missing keywords suggested.</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
