import { useEffect } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

export function RoundTimer({
  initialSeconds,
  className,
  onExpire,
  paused,
}: {
  initialSeconds: number;
  className?: string;
  onExpire?: () => void;
  paused?: boolean;
}) {
  const seconds = useCountdown(initialSeconds, Boolean(paused)) ?? 0;
  const expired = seconds <= 0;
  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-3 py-1 font-semibold tabular-nums inline-block",
        expired ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary",
        className,
      )}
    >
      {expired ? "Tempo!" : `${seconds}s`}
    </span>
  );
}
