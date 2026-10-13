import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Loader2, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { externState } from "@folio/player/extern";
import { RendererHostContext } from "@folio/renderer/host";
import { ScaledSlide, SlideView } from "@folio/renderer/SlideView";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { RoundTimer } from "@/components/match/RoundTimer";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { getMatchState, type MatchState } from "@/lib/api-client";
import { getMatchScreen, presentScreenHost, presentScreenValues } from "@/lib/present-screen";

const PRESENT_MC_COLORS = ["bg-rose-600", "bg-sky-600", "bg-amber-500", "bg-emerald-600"];

export const Route = createFileRoute("/matches/$matchId/present")({
  head: () => ({
    meta: [{ title: "Apresentação — Rodada" }],
  }),
  validateSearch: (search: Record<string, unknown>): { classic?: boolean } =>
    search.classic === undefined
      ? {}
      : { classic: search.classic !== false && search.classic !== "0" },
  component: PresentPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function PresentPage() {
  const { matchId } = Route.useParams();
  const { classic } = Route.useSearch();
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

  return classic ? <ClassicPresent state={query.data} /> : <FolioPresent state={query.data} />;
}

function useCountdown(key: string | null, initial: number | null, paused: boolean) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    setSeconds(initial);
    if (initial === null || paused) return;
    const interval = setInterval(() => {
      setSeconds((value) => (value === null ? value : Math.max(0, value - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [key, initial, paused]);
  return seconds;
}

function FolioPresent({ state }: { state: MatchState }) {
  const screen = useQuery({
    queryKey: ["present-screen", state.match.id],
    queryFn: () => getMatchScreen(state.match.id),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const round = state.currentRound;
  const seconds = useCountdown(
    round?.id ?? null,
    round?.status === "open" ? round.timeRemainingSeconds : null,
    Boolean(round?.selectedParticipantId),
  );
  const deck = screen.data;
  const values = useMemo(
    () => (deck ? externState(deck, presentScreenValues(state, seconds)) : null),
    [deck, state, seconds],
  );
  const ignored = values?.ignored.join(", ") ?? "";
  useEffect(() => {
    if (import.meta.env.DEV && ignored) console.warn(`Telão ignorou: ${ignored}`);
  }, [ignored]);

  if (screen.isError) return <ClassicPresent state={state} />;
  const slide = deck?.slides[0];
  if (!deck || !slide || !values) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <RendererHostContext.Provider value={presentScreenHost}>
      <div className="h-screen w-screen bg-black">
        <ScaledSlide width={deck.meta.width} height={deck.meta.height}>
          <SlideView deck={deck} slide={slide} state={values.state} />
        </ScaledSlide>
      </div>
    </RendererHostContext.Provider>
  );
}

function ClassicPresent({ state }: { state: MatchState }) {
  const match = state.match;
  const round = state.currentRound;
  const mode = state.settings.mode;
  const questionType = round?.question?.type ?? "buzzer";
  const selected = state.participants.find((player) => player.id === round?.selectedParticipantId);
  const leaders = [...state.participants]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 5);
  const matchEnded = match.status === "encerrada";
  const showRanking =
    state.settings.rankingDisplay === "always"
      ? true
      : state.settings.rankingDisplay === "end_only"
        ? matchEnded
        : !round?.question;

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
                Rodada
              </p>
              <h1 className="text-2xl font-semibold">{match.name}</h1>
            </div>
          </div>
          <MatchStatusBadge status={match.status} className="text-sm" />
        </header>

        <main
          className={
            "grid flex-1 grid-cols-1 items-center gap-8" +
            (showRanking ? " lg:grid-cols-[1fr_360px]" : "")
          }
        >
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
                {questionType === "multiple_choice" && round.question.options.length > 0 && (
                  <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                    {round.question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl px-5 py-4 text-xl font-semibold text-white ${PRESENT_MC_COLORS[index % PRESENT_MC_COLORS.length]} ${
                          round.answerRevealed && !option.correct ? "opacity-40" : ""
                        }`}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                )}
                {round.answerRevealed && questionType !== "multiple_choice" && (
                  <p className="mt-8 text-2xl font-medium text-primary sm:text-3xl">
                    {questionType === "true_false"
                      ? round.question.expectedAnswer === "true"
                        ? "Verdadeiro"
                        : "Falso"
                      : round.question.expectedAnswer}
                  </p>
                )}
                <p className="mt-6 text-lg text-muted-foreground">
                  {mode === "buzzer"
                    ? selected
                      ? `${selected.displayName} respondeu primeiro`
                      : "Aguardando resposta dos jogadores"
                    : "Os jogadores respondem pelo celular"}
                </p>
              </>
            ) : (
              <>
                {match.status === "em-andamento" && state.lastRoundResult ? (
                  <>
                    <div
                      className={`mx-auto mb-8 inline-flex flex-col items-center gap-2 rounded-3xl px-10 py-8 ${
                        state.lastRoundResult.result === "correct"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <span className="text-5xl font-bold sm:text-6xl">
                        {state.lastRoundResult.result === "correct" ? "✓ Acertou!" : "✗ Errou"}
                      </span>
                      <span className="text-2xl font-semibold sm:text-3xl">
                        {state.lastRoundResult.displayName ?? "Jogador"}
                      </span>
                      {state.lastRoundResult.result === "correct" &&
                        state.lastRoundResult.pointsApplied > 0 && (
                          <span className="text-xl font-medium sm:text-2xl">
                            +{state.lastRoundResult.pointsApplied} pts
                          </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-medium text-muted-foreground sm:text-3xl">
                      Aguardando próxima pergunta
                    </h2>
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
                  </>
                )}
                {state.winner && (
                  <p className="mt-6 text-2xl text-primary">Vencedor: {state.winner.displayName}</p>
                )}
              </>
            )}
          </section>

          {showRanking && (
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
                        {participant.livesRemaining != null &&
                          !participant.eliminated &&
                          !early && (
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
          )}
        </main>
      </div>
    </div>
  );
}
