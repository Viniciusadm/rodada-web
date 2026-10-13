import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Hand } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoundTimer } from "@/components/match/RoundTimer";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import {
  ApiError,
  errorToMessage,
  getMatchState,
  joinMatch,
  sendPlayerAnswer,
} from "@/lib/api-client";

export const Route = createFileRoute("/play/$matchId")({
  head: () => ({
    meta: [{ title: "Jogar — Rodada" }],
  }),
  component: PlayPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

const MC_COLORS = [
  "bg-rose-600 text-white hover:bg-rose-600/90",
  "bg-sky-600 text-white hover:bg-sky-600/90",
  "bg-amber-500 text-white hover:bg-amber-500/90",
  "bg-emerald-600 text-white hover:bg-emerald-600/90",
];

function PlayPage() {
  const { matchId } = Route.useParams();
  const queryClient = useQueryClient();
  const storageKey = useMemo(() => `games-hub-participant:${matchId}`, [matchId]);
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [expiredRoundId, setExpiredRoundId] = useState<string | null>(null);
  const [answeredRoundId, setAnsweredRoundId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);
  const [wordAnswer, setWordAnswer] = useState("");
  const [armRemaining, setArmRemaining] = useState(0);
  const justJoinedRef = useRef(false);
  const realtime = useRealtimeInvalidation({ channel: `match:${matchId}`, matchId, token });
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
    refetchInterval: realtime.connected ? false : 5_000,
  });

  const clearSession = useCallback(
    (message?: string) => {
      if (typeof window !== "undefined") localStorage.removeItem(storageKey);
      setToken(null);
      setParticipantId(null);
      justJoinedRef.current = false;
      if (message) toast.error(message);
    },
    [storageKey],
  );

  const joinMutation = useMutation({
    mutationFn: () => joinMatch(matchId, name.trim()),
    onSuccess: async (result) => {
      justJoinedRef.current = true;
      setToken(result.participantToken);
      setParticipantId(result.participant.id);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            token: result.participantToken,
            participantId: result.participant.id,
            name: result.participant.displayName,
          }),
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });
  const answerMutation = useMutation({
    mutationFn: async (answer?: string) => {
      const round = query.data?.currentRound;
      if (!round || !token) throw new Error("Não há pergunta aberta para responder.");
      return sendPlayerAnswer(matchId, round.id, token, answer);
    },
    onSuccess: async (result) => {
      const roundId = query.data?.currentRound?.id ?? null;
      if (result.correct === null) {
        // Buzzer: ninguém julga ainda, só registra quem apertou primeiro.
        if (result.early) {
          toast.error("Você clicou cedo demais e perdeu esta rodada.");
        } else {
          toast.success(result.accepted ? "Resposta enviada." : "Alguém respondeu antes.");
        }
      } else if (result.accepted) {
        if (roundId) setAnsweredRoundId(roundId);
        setLastResult(result.correct ? "correct" : "incorrect");
        toast.success(result.correct ? "Acertou!" : "Resposta incorreta.");
      } else {
        if (roundId) setAnsweredRoundId(roundId);
        toast.error("Você já respondeu esta pergunta.");
      }
      await queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
    },
    onError: (error) => {
      // Token inválido/revogado (ex.: partida resetada): limpa a sessão local
      // e volta ao formulário de entrada em vez de mostrar um erro genérico.
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        clearSession("Sua sessão expirou. Entre novamente.");
        return;
      }
      // O servidor recusa respostas após o tempo da pergunta expirar (409).
      if (error instanceof ApiError && error.status === 409 && /expired/i.test(error.message)) {
        toast.error("Tempo esgotado para esta pergunta.");
        return;
      }
      // Buzzer: já desqualificado nesta rodada por clique adiantado (409).
      if (error instanceof ApiError && error.status === 409 && /this round/i.test(error.message)) {
        toast.error("Você está fora desta rodada.");
        return;
      }
      toast.error(errorToMessage(error));
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        token?: string;
        participantId?: string;
        name?: string;
      };
      setToken(parsed.token ?? null);
      setParticipantId(parsed.participantId ?? null);
      setName(parsed.name ?? "");
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Recuperação de token: se temos uma sessão salva mas o participante não está
  // mais na partida (host resetou, token revogado) e a partida não encerrou,
  // limpamos e voltamos ao formulário de entrada.
  useEffect(() => {
    if (!participantId || query.isFetching || !query.data) return;
    const stillThere = query.data.participants.some((item) => item.id === participantId);
    if (stillThere) {
      justJoinedRef.current = false;
      return;
    }
    if (justJoinedRef.current) return;
    if (query.data.match.status !== "encerrada") {
      clearSession("Sua sessão expirou. Entre novamente.");
    }
  }, [participantId, query.isFetching, query.data, clearSession]);

  // Limpa o veredito/entrada ao virar a rodada.
  const currentRoundId = query.data?.currentRound?.id ?? null;
  useEffect(() => {
    setLastResult(null);
    setWordAnswer("");
  }, [currentRoundId]);

  // Buzzer: contagem do estado "armado" do botão. O servidor é a autoridade;
  // aqui é só aviso visual. Inicia na virada da rodada e, quando há tempo de
  // pergunta, sincroniza pelo tempo já decorrido (corrige quem entra no meio).
  useEffect(() => {
    const round = query.data?.currentRound;
    const armDelay = query.data?.settings.buzzerArmDelaySeconds ?? 0;
    if (!round || round.status !== "open" || armDelay <= 0) {
      setArmRemaining(0);
      return;
    }
    const total = query.data?.settings.timePerRoundSeconds ?? null;
    const remaining = round.timeRemainingSeconds ?? null;
    let initial = armDelay;
    if (total != null && remaining != null) {
      initial = Math.max(0, armDelay - (total - remaining));
    }
    setArmRemaining(initial);
    if (initial <= 0) return;
    const interval = setInterval(() => {
      setArmRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoundId]);

  if (query.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando partida...</div>;
  }
  if (query.isError || !query.data) throw notFound();

  const state = query.data;
  const match = state.match;
  const round = state.currentRound;
  const mode = state.settings.mode;
  const questionType = round?.question?.type ?? "buzzer";
  const participant = state.participants.find((item) => item.id === participantId);
  const selected = state.participants.find((item) => item.id === round?.selectedParticipantId);
  const answeredThisRound = Boolean(round && answeredRoundId === round.id);
  const roundExpired =
    round?.status === "open" && (round.timeRemainingSeconds === 0 || expiredRoundId === round.id);
  const buzzerArmed = mode === "buzzer" && armRemaining > 0;
  const iAmEarly = Boolean(participantId && round?.earlyParticipantIds.includes(participantId));

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background sm:items-center sm:justify-center sm:bg-muted/30 sm:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background sm:h-[min(88dvh,760px)] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-border sm:shadow-xl">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary sm:size-12">
            <Gamepad2 className="size-5 text-primary-foreground sm:size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
              Rodada
            </p>
            <h1 className="truncate text-base font-semibold sm:text-xl">{match.name}</h1>
          </div>
        </header>

        {!token ? (
          <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4 text-center sm:gap-5 sm:px-6">
            <Hand className="size-12 text-primary sm:size-16" />
            <p className="text-xl font-semibold sm:text-2xl">Entrar na partida</p>
            <Input
              className="h-11 max-w-sm text-base sm:h-12 sm:text-lg"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && name.trim()) joinMutation.mutate();
              }}
              placeholder="Seu nome"
            />
            <Button
              className="h-11 w-full max-w-sm rounded-lg text-base sm:h-12 sm:text-lg"
              disabled={!name.trim() || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
            >
              Entrar
            </Button>
          </main>
        ) : (
          <>
            {participant && (
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-left sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground sm:text-xs">
                    Jogando como
                  </p>
                  <p className="truncate text-base font-semibold sm:text-lg">
                    {participant.displayName ?? name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-primary sm:text-2xl">
                    {participant.currentScore} pts
                  </p>
                  {participant.livesRemaining != null && (
                    <p className="text-sm text-rose-500 sm:text-base">
                      {participant.eliminated
                        ? "Eliminado"
                        : `${"♥".repeat(Math.max(0, participant.livesRemaining)) || "—"}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-3 text-center sm:gap-4 sm:px-6 sm:py-4">
              {participant?.eliminated ? (
                <p className="rounded-lg bg-destructive/10 p-5 text-xl text-destructive sm:text-2xl">
                  Você ficou sem vidas. Acompanhe o restante da partida pela apresentação.
                </p>
              ) : round?.question ? (
                <div className="flex min-h-0 w-full flex-1 flex-col gap-3 sm:gap-4">
                  {round.status === "open" && round.timeRemainingSeconds !== null && (
                    <RoundTimer
                      key={round.id}
                      initialSeconds={round.timeRemainingSeconds}
                      className="text-2xl px-4 py-1.5 sm:text-3xl sm:px-5 sm:py-2"
                      onExpire={() => setExpiredRoundId(round.id)}
                      paused={Boolean(round.selectedParticipantId)}
                    />
                  )}
                  <p className="min-h-0 shrink overflow-y-auto break-words text-lg font-bold leading-snug sm:text-2xl">
                    {round.question.prompt}
                  </p>
                  {round.answerRevealed && (
                    <p className="rounded-lg bg-muted/40 p-3 text-base font-semibold sm:text-xl">
                      {questionType === "true_false"
                        ? round.question.expectedAnswer === "true"
                          ? "Verdadeiro"
                          : "Falso"
                        : round.question.expectedAnswer}
                    </p>
                  )}

                  {mode === "buzzer" ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 sm:gap-4">
                      {iAmEarly ? (
                        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                          Você clicou cedo demais e está fora desta rodada. Aguarde a próxima
                          pergunta.
                        </p>
                      ) : (
                        <Button
                          className={
                            buzzerArmed
                              ? "size-[min(70vw,38dvh,18rem)] flex-col gap-1 rounded-full bg-amber-500 text-xl font-semibold text-white shadow-lg hover:bg-amber-500/90 sm:text-2xl"
                              : "size-[min(70vw,38dvh,18rem)] flex-col gap-2 rounded-full text-2xl font-semibold shadow-lg sm:text-3xl"
                          }
                          disabled={
                            answerMutation.isPending ||
                            Boolean(round.selectedParticipantId) ||
                            roundExpired
                          }
                          onClick={() => answerMutation.mutate(undefined)}
                        >
                          {buzzerArmed ? (
                            <>
                              <span className="text-5xl font-bold tabular-nums sm:text-6xl">
                                {armRemaining}
                              </span>
                              <span className="text-xs uppercase tracking-wide sm:text-sm">
                                não clique
                              </span>
                            </>
                          ) : (
                            <>
                              <Hand className="!size-10 sm:!size-12" />
                              Eu sei
                            </>
                          )}
                        </Button>
                      )}
                      <div className="flex min-h-[2.75rem] items-start justify-center">
                        {buzzerArmed && !iAmEarly ? (
                          <p className="text-sm text-amber-600 sm:text-base">
                            Aguarde {armRemaining}s para liberar. Clicar agora elimina você desta
                            rodada.
                          </p>
                        ) : roundExpired && !round.selectedParticipantId ? (
                          <p className="text-sm text-destructive sm:text-base">
                            Tempo esgotado. Aguarde o anfitrião.
                          </p>
                        ) : selected ? (
                          <p className="text-sm text-muted-foreground sm:text-base">
                            {selected.id === participantId
                              ? "Sua resposta foi recebida."
                              : `${selected.displayName} respondeu primeiro.`}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : answeredThisRound ? (
                    <div className="flex min-h-0 flex-1 items-center justify-center">
                      <p
                        className={`rounded-2xl px-5 py-3 text-2xl font-bold sm:text-4xl ${
                          lastResult === "correct"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : lastResult === "incorrect"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {lastResult === "correct"
                          ? "Você acertou!"
                          : lastResult === "incorrect"
                            ? "Resposta incorreta."
                            : "Resposta registrada."}
                      </p>
                    </div>
                  ) : roundExpired ? (
                    <div className="flex min-h-0 flex-1 items-center justify-center">
                      <p className="text-2xl font-bold text-destructive sm:text-3xl">
                        Tempo esgotado.
                      </p>
                    </div>
                  ) : questionType === "multiple_choice" ? (
                    <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                      {round.question.options.map((option, index) => (
                        <Button
                          key={index}
                          className={`h-full w-full whitespace-normal rounded-2xl text-base font-bold shadow-md sm:text-xl ${MC_COLORS[index % MC_COLORS.length]}`}
                          disabled={answerMutation.isPending}
                          onClick={() => answerMutation.mutate(String(index))}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  ) : questionType === "true_false" ? (
                    <div className="flex min-h-0 flex-1 gap-2.5 sm:gap-3">
                      <Button
                        className="h-full flex-1 rounded-2xl bg-emerald-600 text-2xl font-semibold text-white shadow-md hover:bg-emerald-600/90 sm:text-3xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("true")}
                      >
                        Verdadeiro
                      </Button>
                      <Button
                        className="h-full flex-1 rounded-2xl bg-rose-600 text-2xl font-semibold text-white shadow-md hover:bg-rose-600/90 sm:text-3xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("false")}
                      >
                        Falso
                      </Button>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
                      <Input
                        className="h-14 text-center text-lg sm:text-xl"
                        value={wordAnswer}
                        onChange={(event) => setWordAnswer(event.target.value)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            wordAnswer.trim() &&
                            !answerMutation.isPending
                          ) {
                            answerMutation.mutate(wordAnswer);
                          }
                        }}
                        placeholder="Sua resposta"
                      />
                      <Button
                        className="h-14 w-full rounded-xl text-lg font-semibold sm:text-xl"
                        disabled={!wordAnswer.trim() || answerMutation.isPending}
                        onClick={() => answerMutation.mutate(wordAnswer)}
                      >
                        Responder
                      </Button>
                    </div>
                  )}
                </div>
              ) : match.status !== "encerrada" && state.lastRoundResult ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 sm:gap-4">
                  <p
                    className={`rounded-2xl px-5 py-3 text-2xl font-bold sm:text-4xl ${
                      state.lastRoundResult.result === "correct"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {state.lastRoundResult.participantId === participantId
                      ? state.lastRoundResult.result === "correct"
                        ? `Você acertou!${
                            state.lastRoundResult.pointsApplied > 0
                              ? ` +${state.lastRoundResult.pointsApplied} pts`
                              : ""
                          }`
                        : "Você errou."
                      : `${state.lastRoundResult.displayName ?? "Jogador"} ${
                          state.lastRoundResult.result === "correct" ? "acertou" : "errou"
                        }`}
                  </p>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    Aguardando a próxima pergunta.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <p className="text-xl font-medium text-muted-foreground sm:text-2xl">
                    {match.status === "encerrada"
                      ? "Partida encerrada."
                      : "Aguardando o anfitrião sortear a próxima pergunta."}
                  </p>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
