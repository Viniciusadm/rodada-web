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
        toast.success(result.accepted ? "Resposta enviada." : "Alguém respondeu antes.");
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
  // Espelha a regra do servidor: rodada aberta cujo tempo chegou a zero (pelo
  // snapshot do servidor ou pelo relógio local) não aceita mais "Eu sei".
  const roundExpired =
    round?.status === "open" && (round.timeRemainingSeconds === 0 || expiredRoundId === round.id);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 px-6 text-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-xl shadow-primary/30">
          <Gamepad2 className="size-7 text-primary-foreground" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Games Hub
          </p>
          <h1 className="text-xl font-semibold">{match.name}</h1>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        {!token ? (
          <div className="space-y-4">
            <Hand className="mx-auto size-12 text-primary" />
            <p className="text-lg font-semibold">Entrar na partida</p>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && name.trim()) joinMutation.mutate();
              }}
              placeholder="Seu nome"
            />
            <Button
              className="w-full rounded-lg"
              disabled={!name.trim() || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
            >
              Entrar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Jogando como</p>
              <p className="text-lg font-semibold">{participant?.displayName ?? name}</p>
              {participant && (
                <p className="text-sm text-primary">{participant.currentScore} pontos</p>
              )}
              {participant?.livesRemaining != null && (
                <p className="text-sm text-rose-500">
                  {participant.eliminated
                    ? "Você foi eliminado"
                    : `${"♥".repeat(Math.max(0, participant.livesRemaining)) || "—"} vidas`}
                </p>
              )}
            </div>

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
                    <Button
                      className="h-24 w-24 rounded-full text-base"
                      disabled={
                        answerMutation.isPending ||
                        Boolean(round.selectedParticipantId) ||
                        roundExpired
                      }
                      onClick={() => answerMutation.mutate(undefined)}
                    >
                      <Hand className="mr-1 size-5" /> Eu sei
                    </Button>
                    {roundExpired && !round.selectedParticipantId && (
                      <p className="text-sm text-destructive">
                        Tempo esgotado. Aguarde o anfitrião.
                      </p>
                    )}
                    {selected && (
                      <p className="text-sm text-muted-foreground">
                        {selected.id === participantId
                          ? "Sua resposta foi recebida."
                          : `${selected.displayName} respondeu primeiro.`}
                      </p>
                    )}
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
                      ? "Você acertou! 🎉"
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
          </div>
        )}
      </div>
    </div>
  );
}
