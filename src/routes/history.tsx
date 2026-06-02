import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Trophy, Users } from "lucide-react";
import { useState } from "react";
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
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading && (
          <div className="p-6 text-sm text-muted-foreground">Carregando histórico...</div>
        )}
        {isError && (
          <div className="p-6 text-sm text-muted-foreground">
            Não foi possível carregar o histórico.
          </div>
        )}
        {!isLoading && !isError && finished.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma partida encerrada.</div>
        )}
        {!isLoading &&
          !isError &&
          finished.map((m) => (
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
