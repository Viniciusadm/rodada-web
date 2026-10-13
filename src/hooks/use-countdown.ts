import { useEffect, useState } from "react";

export function useCountdown(initial: number | null, paused: boolean, resetKey?: unknown) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    setSeconds(initial);
    if (initial === null || paused) return;
    const interval = setInterval(() => {
      setSeconds((value) => (value === null ? value : Math.max(0, value - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [initial, paused, resetKey]);
  return seconds;
}
