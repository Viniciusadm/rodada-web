import { cn } from "@/lib/utils";
import type { GameStatus } from "@/lib/api-client";

const statusLabel: Record<GameStatus, string> = {
  active: "Ativo",
  beta: "Beta",
  maintenance: "Manutenção",
  "coming-soon": "Em breve",
  archived: "Arquivado",
};

const styles: Record<GameStatus, string> = {
  active: "bg-success/15 text-success ring-success/25",
  beta: "bg-primary/15 text-primary ring-primary/25",
  maintenance: "bg-warning/15 text-warning ring-warning/25",
  "coming-soon": "bg-muted text-muted-foreground ring-border",
  archived: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ status, className }: { status: GameStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
        styles[status],
        className,
      )}
    >
      {status === "active" && <span className="size-1.5 rounded-full bg-success" />}
      {statusLabel[status]}
    </span>
  );
}
