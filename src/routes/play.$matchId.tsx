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
    meta: [{ title: "Jogar — Games Hub" }],
  }),
  component: PlayPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

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
  const realtime = useRealtimeInvalidation({ channel: `match:${matchId}`, matchId });
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
  const gameKind = state.settings.gameKind;
  const participant = state.participants.find((item) => item.id === participantId);
  const selected = state.participants.find((item) => item.id === round?.selectedParticipantId);
  const answeredThisRound = Boolean(round && answeredRoundId === round.id);
  const roundExpired =
    round?.status === "open" && (round.timeRemainingSeconds === 0 || expiredRoundId === round.id);
  const buzzerArmed = gameKind === "buzzer" && armRemaining > 0;
  const iAmEarly = Boolean(participantId && round?.earlyParticipantIds.includes(participantId));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background sm:items-center sm:justify-center sm:bg-muted/30 sm:p-6">
      <div className="flex min-h-[100dvh] w-full flex-col bg-background sm:h-[min(88dvh,760px)] sm:min-h-0 sm:max-w-md sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:shadow-xl">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <Gamepad2 className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Games Hub
            </p>
            <h1 className="truncate text-base font-semibold">{match.name}</h1>
          </div>
        </header>

        {!token ? (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <Hand className="size-12 text-primary" />
            <p className="text-lg font-semibold">Entrar na partida</p>
            <Input
              className="max-w-xs"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && name.trim()) joinMutation.mutate();
              }}
              placeholder="Seu nome"
            />
            <Button
              className="w-full max-w-xs rounded-lg"
              disabled={!name.trim() || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
            >
              Entrar
            </Button>
          </main>
        ) : (
          <>
            {participant && (
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 text-left">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Jogando como
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {participant.displayName ?? name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-primary">
                    {participant.currentScore} pts
                  </p>
                  {participant.livesRemaining != null && (
                    <p className="text-xs text-rose-500">
                      {participant.eliminated
                        ? "Eliminado"
                        : `${"♥".repeat(Math.max(0, participant.livesRemaining)) || "—"}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
              {participant?.eliminated ? (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  Você ficou sem vidas. Acompanhe o restante da partida pela apresentação.
                </p>
              ) : round?.question ? (
                <div className="space-y-4">
                  {round.status === "open" && round.timeRemainingSeconds !== null && (
                    <RoundTimer
                      key={round.id}
                      initialSeconds={round.timeRemainingSeconds}
                      className="text-base"
                      onExpire={() => setExpiredRoundId(round.id)}
                      paused={Boolean(round.selectedParticipantId)}
                    />
                  )}
                  <p className="text-lg font-semibold">{round.question.prompt}</p>
                  {round.answerRevealed && (
                    <p className="rounded-lg bg-muted/40 p-3 text-sm">
                      {gameKind === "true_false"
                        ? round.question.expectedAnswer === "true"
                          ? "Verdadeiro"
                          : "Falso"
                        : round.question.expectedAnswer}
                    </p>
                  )}

                  {gameKind === "buzzer" ? (
                    <>
                      {iAmEarly ? (
                        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                          Você clicou cedo demais e está fora desta rodada. Aguarde a próxima
                          pergunta.
                        </p>
                      ) : (
                        <Button
                          className={
                            buzzerArmed
                              ? "size-[min(75vw,22rem)] flex-col gap-1 rounded-full bg-amber-500 text-2xl font-semibold text-white shadow-lg hover:bg-amber-500/90"
                              : "size-[min(75vw,22rem)] flex-col gap-2 rounded-full text-3xl font-semibold shadow-lg"
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
                              <span className="text-6xl font-bold tabular-nums">
                                {armRemaining}
                              </span>
                              <span className="text-sm uppercase tracking-wide">não clique</span>
                            </>
                          ) : (
                            <>
                              <Hand className="!size-12" />
                              Eu sei
                            </>
                          )}
                        </Button>
                      )}
                      <div className="flex min-h-[3.5rem] items-start justify-center">
                        {buzzerArmed && !iAmEarly ? (
                          <p className="text-sm text-amber-600">
                            Aguarde {armRemaining}s para liberar. Clicar agora elimina você desta
                            rodada.
                          </p>
                        ) : roundExpired && !round.selectedParticipantId ? (
                          <p className="text-sm text-destructive">
                            Tempo esgotado. Aguarde o anfitrião.
                          </p>
                        ) : selected ? (
                          <p className="text-sm text-muted-foreground">
                            {selected.id === participantId
                              ? "Sua resposta foi recebida."
                              : `${selected.displayName} respondeu primeiro.`}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : answeredThisRound ? (
                    <p
                      className={`rounded-lg p-3 text-sm font-medium ${
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
                  ) : roundExpired ? (
                    <p className="text-sm text-destructive">Tempo esgotado.</p>
                  ) : gameKind === "true_false" ? (
                    <div className="flex justify-center gap-3">
                      <Button
                        className="rounded-xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("true")}
                      >
                        Verdadeiro
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("false")}
                      >
                        Falso
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
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
                        className="w-full rounded-lg"
                        disabled={!wordAnswer.trim() || answerMutation.isPending}
                        onClick={() => answerMutation.mutate(wordAnswer)}
                      >
                        Responder
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {match.status === "encerrada"
                    ? "Partida encerrada."
                    : "Aguardando o anfitrião sortear a próxima pergunta."}
                </p>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
