import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { matches } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Histórico de partidas — HolyPlay" },
      { name: "description", content: "Histórico completo das partidas jogadas na sua igreja." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Histórico de partidas" description="Acompanhe as últimas atividades da HolyPlay na sua igreja." />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {matches.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-1 gap-3 border-b border-border/60 p-5 last:border-0 hover:bg-muted/30 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{m.gameName}</h3>
                <span className="text-xs text-muted-foreground">• {m.room}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {m.date}</span>
                <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {m.players} jogadores</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {m.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 ring-1 ring-primary/20 md:justify-self-end">
              <Trophy className="size-4 text-primary" />
              <div className="text-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vencedor</p>
                <p className="font-medium">{m.winner}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
