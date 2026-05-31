import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Trophy } from "lucide-react";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { getMatchState } from "@/lib/api-client";

export const Route = createFileRoute("/matches/$matchId/present")({
  head: () => ({
    meta: [{ title: "Apresentação — HolyPlay" }],
  }),
  component: PresentPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function PresentPage() {
  const { matchId } = Route.useParams();
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
    refetchInterval: 1500,
  });

  if (query.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando apresentação...</div>;
  }
  if (query.isError || !query.data) throw notFound();

  const state = query.data;
  const match = state.match;
  const round = state.currentRound;
  const selected = state.participants.find((player) => player.id === round?.selectedParticipantId);
  const leaders = [...state.participants]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col p-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-xl shadow-primary/30">
              <Sparkles className="size-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                HolyPlay
              </p>
              <h1 className="text-2xl font-semibold">{match.name}</h1>
            </div>
          </div>
          <MatchStatusBadge status={match.status} className="text-sm" />
        </header>

        <main className="grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_360px]">
          <section className="text-center">
            {round?.question ? (
              <>
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  Pergunta {round.roundNumber}
                </p>
                <h2 className="text-5xl font-semibold leading-tight">{round.question.prompt}</h2>
                {round.answerRevealed && (
                  <p className="mt-8 text-3xl font-medium text-primary">
                    {round.question.expectedAnswer}
                  </p>
                )}
                <p className="mt-6 text-lg text-muted-foreground">
                  {selected
                    ? `${selected.displayName} respondeu primeiro`
                    : "Aguardando resposta dos jogadores"}
                </p>
              </>
            ) : (
              <>
                <Trophy className="mx-auto mb-6 size-16 text-primary" />
                <h2 className="text-5xl font-semibold">
                  {match.status === "encerrada"
                    ? "Partida encerrada"
                    : match.status === "em-andamento"
                      ? "Aguardando próxima pergunta"
                      : "Aguardando início"}
                </h2>
                {state.winner && (
                  <p className="mt-6 text-2xl text-primary">Vencedor: {state.winner.displayName}</p>
                )}
              </>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card/80 p-5">
            <h3 className="mb-4 text-base font-semibold">Placar</h3>
            <div className="space-y-2">
              {leaders.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
                >
                  <span className="text-sm font-medium">
                    {index + 1}. {participant.displayName}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {participant.currentScore}
                  </span>
                </div>
              ))}
              {leaders.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem participantes.</p>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
