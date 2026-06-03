import { useEffect, useState } from "react";
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
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    setSeconds(initialSeconds);
    if (paused) return;
    const interval = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds, paused]);
  const expired = seconds <= 0;
  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-3 py-1 font-semibold tabular-nums mb-4 inline-block",
        expired ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary",
        className,
      )}
    >
      {expired ? "Tempo!" : `${seconds}s`}
    </span>
  );
}
