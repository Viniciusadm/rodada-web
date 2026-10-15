import { cn } from "@/lib/utils";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" fill="#349ef4" />
      <rect x="7" y="15" width="5" height="10" rx="1.5" fill="#fff" opacity="0.85" />
      <rect x="13.5" y="8" width="5" height="17" rx="1.5" fill="#fff" />
      <rect x="20" y="18" width="5" height="7" rx="1.5" fill="#fff" opacity="0.65" />
    </svg>
  );
}

export function Logo({
  size = 30,
  className,
  wordClassName,
}: {
  size?: number;
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className={cn("font-display text-xl font-bold tracking-[-0.02em]", wordClassName)}>
        Rodada
      </span>
    </span>
  );
}
