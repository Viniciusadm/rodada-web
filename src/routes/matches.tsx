import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle, Play, ListChecks, Trash2, Users, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { useMatchStore, getModeLabel } from "@/lib/match-store";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Partidas — HolyPlay" },
      { name: "description", content: "Gerencie e conduza partidas de jogos bíblicos." },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const matches = useMatchStore((s) => Object.values(s.matches));
  const deleteMatch = useMatchStore((s) => s.deleteMatch);
  const sorted = [...matches].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Partidas"
        description="Crie, gerencie e conduza partidas de quiz para sua igreja."
        actions={
          <Button asChild className="rounded-lg">
            <Link to="/matches/new">
              <PlusCircle className="mr-1 size-4" /> Nova partida
            </Link>
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma partida criada ainda.</p>
          <Button asChild className="mt-4 rounded-lg">
            <Link to="/matches/new">Criar primeira partida</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold">{m.name}</h3>
                <MatchStatusBadge status={m.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Modo: <span className="text-foreground">{getModeLabel(m.mode)}</span>
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
                <div>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <HelpCircle className="size-3" /> Perguntas
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">{m.questions.length}</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Users className="size-3" /> Jogadores
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">{m.players.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PIN</p>
                  <p className="mt-0.5 font-mono text-base font-semibold tracking-wider">{m.joinPin}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="flex-1 rounded-lg">
                  <Link to="/matches/$matchId/host" params={{ matchId: m.id }}>
                    <Play className="mr-1 size-3.5" /> Painel
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link to="/matches/$matchId/questions" params={{ matchId: m.id }}>
                    <ListChecks className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Excluir a partida "${m.name}"?`)) {
                      deleteMatch(m.id);
                      toast.success("Partida excluída.");
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
