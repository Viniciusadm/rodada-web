import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, HelpCircle, ListChecks, Play, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { useMatchesQuery } from "@/features/games-hub-data";

export const Route = createFileRoute("/matches/")({
  head: () => ({
    meta: [
      { title: "Partidas — Rodada" },
      { name: "description", content: "Gerencie e conduza partidas de jogos." },
    ],
  }),
  component: MatchesPage,
});

function roundStatusLabel(status: "open" | "answer_revealed" | "closed"): string {
  switch (status) {
    case "open":
      return "Aberta";
    case "answer_revealed":
      return "Resposta revelada";
    case "closed":
      return "Fechada";
  }
}

function MatchesPage() {
  const { data: matches = [], isLoading, isError } = useMatchesQuery();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Partidas"
        description="Crie, gerencie e conduza partidas de quiz para sua comunidade."
        actions={
          <Button asChild className="rounded-lg">
            <Link to="/matches/new">
              <PlusCircle className="mr-1 size-4" /> Nova partida
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[212px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Não foi possível carregar as partidas.
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Nenhuma partida criada ainda"
          description="Crie sua primeira partida para reunir seu grupo e começar a jogar."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/matches/new">Criar primeira partida</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold">{m.name}</h3>
                <MatchStatusBadge status={m.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
                <div>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <HelpCircle className="size-3" /> Perguntas
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">{m.questionCount}</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Users className="size-3" /> Jogadores
                  </p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">
                    {m.participantCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rodada</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums">
                    {m.currentRoundNumber ? `${m.currentRoundNumber}ª` : "—"}
                  </p>
                  {m.currentRoundStatus && (
                    <p className="text-[11px] font-normal text-muted-foreground">
                      {roundStatusLabel(m.currentRoundStatus)}
                    </p>
                  )}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
