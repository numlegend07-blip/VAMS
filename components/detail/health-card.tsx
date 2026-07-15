import { HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  score: number;
};

export default function HealthCard({
  score,
}: Props) {
  const tone =
    score >= 80
      ? { text: "text-success", bar: "bg-success", subtle: "bg-success-subtle" }
      : score >= 60
        ? { text: "text-warning", bar: "bg-warning", subtle: "bg-warning-subtle" }
        : { text: "text-danger", bar: "bg-danger", subtle: "bg-danger-subtle" };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone.subtle)}>
            <HeartPulse className={cn("h-4 w-4", tone.text)} strokeWidth={2.25} />
          </span>
          Health Score
        </div>
        <span className={cn("text-3xl font-bold", tone.text)}>{score}%</span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn("h-full rounded-full", tone.bar)}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">สถานะโดยรวมของวาล์ว</p>
    </div>
  );
}
