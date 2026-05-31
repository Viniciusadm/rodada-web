import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/games/StatusBadge";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/api-client";

export function GameCard({ game }: { game: Game }) {
  const Icon = game.icon;
  const disabled = game.status === "maintenance" || game.status === "coming-soon";
  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all",
        disabled
          ? "opacity-70"
          : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
      )}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className={cn("flex size-12 items-center justify-center rounded-xl", game.iconColor)}>
          <Icon className="size-6" />
        </div>
        <StatusBadge status={game.status} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{game.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{game.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{game.modes.length} modos</span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {game.players} {game.players === 1 ? "jogador" : "jogadores"}
          </span>
        </div>
        <Button asChild size="sm" disabled={disabled} className="rounded-lg">
          <Link to="/matches/new">
            Criar partida
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
