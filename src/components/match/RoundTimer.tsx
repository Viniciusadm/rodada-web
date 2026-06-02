import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/// Local countdown seeded from the server's snapshot. Re-mount it (via a `key` on
/// the round id) when a new round opens so it always starts from the server's
/// authoritative value; polling/realtime keeps the snapshot honest.
export function RoundTimer({
  initialSeconds,
  className,
  onExpire,
}: {
  initialSeconds: number;
  className?: string;
  /// Fired when the local countdown reaches zero, so the parent can mirror the
  /// server's time enforcement (which already rejects late answers).
  onExpire?: () => void;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    setSeconds(initialSeconds);
    const interval = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);
  const expired = seconds <= 0;
  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-3 py-1 font-semibold tabular-nums",
        expired ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary",
        className,
      )}
    >
      {expired ? "Tempo!" : `${seconds}s`}
    </span>
  );
}
