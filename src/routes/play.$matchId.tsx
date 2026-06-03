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
    <div className="flex min-h-[100dvh] flex-col bg-background sm:items-center sm:justify-center sm:bg-muted/30 sm:p-6">
      <div className="flex min-h-[100dvh] w-full flex-col bg-background sm:h-[min(88dvh,760px)] sm:min-h-0 sm:max-w-2xl sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:shadow-xl">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary">
            <Gamepad2 className="size-7 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Games Hub
            </p>
            <h1 className="truncate text-xl font-semibold">{match.name}</h1>
          </div>
        </header>

        {!token ? (
          <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
            <Hand className="size-16 text-primary" />
            <p className="text-2xl font-semibold">Entrar na partida</p>
            <Input
              className="h-12 max-w-sm text-lg"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && name.trim()) joinMutation.mutate();
              }}
              placeholder="Seu nome"
            />
            <Button
              className="h-12 w-full max-w-sm rounded-lg text-lg"
              disabled={!name.trim() || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
            >
              Entrar
            </Button>
          </main>
        ) : (
          <>
            {participant && (
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 text-left">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Jogando como
                  </p>
                  <p className="truncate text-lg font-semibold">
                    {participant.displayName ?? name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold text-primary">
                    {participant.currentScore} pts
                  </p>
                  {participant.livesRemaining != null && (
                    <p className="text-base text-rose-500">
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
                <p className="rounded-lg bg-destructive/10 p-6 text-2xl text-destructive">
                  Você ficou sem vidas. Acompanhe o restante da partida pela apresentação.
                </p>
              ) : round?.question ? (
                <div className="flex w-full flex-1 flex-col gap-6">
                  {round.status === "open" && round.timeRemainingSeconds !== null && (
                    <RoundTimer
                      key={round.id}
                      initialSeconds={round.timeRemainingSeconds}
                      className="text-3xl px-5 py-2"
                      onExpire={() => setExpiredRoundId(round.id)}
                      paused={Boolean(round.selectedParticipantId)}
                    />
                  )}
                  <p className="break-words text-2xl font-bold sm:text-3xl">
                    {round.question.prompt}
                  </p>
                  {round.answerRevealed && (
                    <p className="rounded-lg bg-muted/40 p-4 text-xl font-semibold sm:text-2xl">
                      {questionType === "true_false"
                        ? round.question.expectedAnswer === "true"
                          ? "Verdadeiro"
                          : "Falso"
                        : round.question.expectedAnswer}
                    </p>
                  )}

                  {mode === "buzzer" ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
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
                          <p className="text-lg text-amber-600">
                            Aguarde {armRemaining}s para liberar. Clicar agora elimina você desta
                            rodada.
                          </p>
                        ) : roundExpired && !round.selectedParticipantId ? (
                          <p className="text-lg text-destructive">
                            Tempo esgotado. Aguarde o anfitrião.
                          </p>
                        ) : selected ? (
                          <p className="text-lg text-muted-foreground">
                            {selected.id === participantId
                              ? "Sua resposta foi recebida."
                              : `${selected.displayName} respondeu primeiro.`}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : answeredThisRound ? (
                    <div className="flex flex-1 items-center justify-center">
                      <p
                        className={`rounded-2xl p-6 text-4xl font-bold sm:text-5xl ${
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
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-3xl font-bold text-destructive">Tempo esgotado.</p>
                    </div>
                  ) : questionType === "multiple_choice" ? (
                    <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
                      {round.question.options.map((option, index) => (
                        <Button
                          key={index}
                          className={`h-full min-h-[5.5rem] w-full whitespace-normal rounded-2xl text-xl font-bold shadow-md sm:text-2xl ${MC_COLORS[index % MC_COLORS.length]}`}
                          disabled={answerMutation.isPending}
                          onClick={() => answerMutation.mutate(String(index))}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  ) : questionType === "true_false" ? (
                    <div className="flex flex-1 gap-3">
                      <Button
                        className="h-full min-h-[8rem] flex-1 rounded-2xl bg-emerald-600 text-3xl font-semibold text-white shadow-md hover:bg-emerald-600/90 sm:text-4xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("true")}
                      >
                        Verdadeiro
                      </Button>
                      <Button
                        className="h-full min-h-[8rem] flex-1 rounded-2xl bg-rose-600 text-3xl font-semibold text-white shadow-md hover:bg-rose-600/90 sm:text-4xl"
                        disabled={answerMutation.isPending}
                        onClick={() => answerMutation.mutate("false")}
                      >
                        Falso
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col justify-center gap-3">
                      <Input
                        className="h-16 text-center text-xl"
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
                        className="h-16 w-full rounded-xl text-xl font-semibold"
                        disabled={!wordAnswer.trim() || answerMutation.isPending}
                        onClick={() => answerMutation.mutate(wordAnswer)}
                      >
                        Responder
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-2xl font-medium text-muted-foreground">
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
