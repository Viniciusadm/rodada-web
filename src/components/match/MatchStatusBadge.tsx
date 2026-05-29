import { cn } from "@/lib/utils";
import { getStatusLabel, type MatchStatus } from "@/lib/match-store";

const styles: Record<MatchStatus, string> = {
  aguardando: "bg-muted text-muted-foreground ring-border",
  "em-andamento": "bg-success/15 text-success ring-success/30",
  encerrada: "bg-primary/15 text-primary ring-primary/30",
};

export function MatchStatusBadge({
  status,
  className,
}: {
  status: MatchStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
        styles[status],
        className,
      )}
    >
      {status === "em-andamento" && (
        <span className="size-1.5 animate-pulse rounded-full bg-success" />
      )}
      {getStatusLabel(status)}
    </span>
  );
}
