import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Loader2, Trophy } from "lucide-react";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { RoundTimer } from "@/components/match/RoundTimer";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { getMatchState } from "@/lib/api-client";

export const Route = createFileRoute("/matches/$matchId/present")({
  head: () => ({
    meta: [{ title: "Apresentação — Games Hub" }],
  }),
  component: PresentPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function PresentPage() {
  const { matchId } = Route.useParams();
  const realtime = useRealtimeInvalidation({ channel: `match:${matchId}`, matchId });
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
    refetchInterval: realtime.connected ? false : 10_000,
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col p-4 sm:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
              <Gamepad2 className="size-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Games Hub
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
                {round.status === "open" && round.timeRemainingSeconds !== null && (
                  <div className="mb-6 flex justify-center">
                    <RoundTimer
                      key={round.id}
                      initialSeconds={round.timeRemainingSeconds}
                      className="text-2xl"
                      paused={Boolean(round.selectedParticipantId)}
                    />
                  </div>
                )}
                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  {round.question.prompt}
                </h2>
                {round.answerRevealed && (
                  <p className="mt-8 text-2xl font-medium text-primary sm:text-3xl">
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
                <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
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
              {leaders.map((participant, index) => {
                const early = Boolean(round?.earlyParticipantIds.includes(participant.id));
                return (
                  <div
                    key={participant.id}
                    className={
                      "flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3" +
                      (participant.eliminated || early ? " opacity-50" : "")
                    }
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {index + 1}. {participant.displayName}
                      {participant.livesRemaining != null && !participant.eliminated && !early && (
                        <span className="text-rose-500">
                          {"♥".repeat(Math.max(0, participant.livesRemaining))}
                        </span>
                      )}
                      {participant.eliminated && (
                        <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                          Fora
                        </span>
                      )}
                      {early && !participant.eliminated && (
                        <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                          Fora (rodada)
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {participant.currentScore}
                    </span>
                  </div>
                );
              })}
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
