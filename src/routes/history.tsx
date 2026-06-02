import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, History, Layers, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { MatchHistoryDetailDialog } from "@/components/match/MatchHistoryDetailDialog";
import { useMatchesQuery } from "@/features/games-hub-data";
import type { MatchSummary } from "@/lib/api-client";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Histórico de partidas — Games Hub" },
      {
        name: "description",
        content: "Histórico completo das partidas jogadas na sua comunidade.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: matches = [], isLoading, isError } = useMatchesQuery();
  const finished = matches.filter((match) => match.status === "encerrada");
  const [selected, setSelected] = useState<MatchSummary | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Histórico de partidas"
        description="Acompanhe as últimas atividades do Games Hub na sua comunidade."
      />
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Não foi possível carregar o histórico.
        </div>
      )}
      {!isLoading && !isError && finished.length === 0 && (
        <EmptyState
          icon={History}
          title="Nenhuma partida encerrada"
          description="Quando você encerrar uma partida, ela aparece aqui com placar, duração e vencedor."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/matches/new">Nova partida</Link>
            </Button>
          }
        />
      )}
      {!isLoading && !isError && finished.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {finished.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className="grid w-full grid-cols-1 gap-3 border-b border-border/60 p-5 text-left last:border-0 hover:bg-muted/30 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{m.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {m.gameName} · {m.modeName}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> {formatDateTime(m.endedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {m.participantCount} participantes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="size-3.5" /> {m.roundsPlayed} rodadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {formatDuration(m.durationSeconds)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 ring-1 ring-primary/20 md:justify-self-end">
                <Trophy className="size-4 text-primary" />
                <div className="text-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resultado
                  </p>
                  <p className="font-medium">
                    {m.winnerName ? `${m.winnerName} · ${m.winnerScore ?? 0} pts` : "Sem vencedor"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <MatchHistoryDetailDialog
        match={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
