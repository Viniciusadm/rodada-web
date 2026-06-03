import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  ListChecks,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Shuffle,
  StopCircle,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { RoundTimer } from "@/components/match/RoundTimer";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import {
  addParticipant,
  adjustScore,
  drawMatchQuestion,
  endMatch,
  errorToMessage,
  getMatchState,
  registerAnswer,
  resetMatch,
  revealAnswer,
  startMatch,
  type MatchParticipant,
} from "@/lib/api-client";

export const Route = createFileRoute("/matches/$matchId/host")({
  head: () => ({
    meta: [{ title: "Painel do anfitrião — Games Hub" }],
  }),
  component: HostPanel,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function HostPanel() {
  const { matchId } = Route.useParams();
  const queryClient = useQueryClient();
  const [participantName, setParticipantName] = useState("");
  const realtime = useRealtimeInvalidation({ channel: `match:${matchId}`, matchId });
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
    refetchInterval: realtime.connected ? false : 10_000,
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
    await queryClient.invalidateQueries({ queryKey: ["matches"] });
  };
  const action = useMutation({
    mutationFn: async (kind: "start" | "draw" | "end" | "reset" | "reveal") => {
      if (kind === "start") return startMatch(matchId);
      if (kind === "draw") return drawMatchQuestion(matchId);
      if (kind === "end") return endMatch(matchId);
      if (kind === "reset") return resetMatch(matchId);
      const roundId = query.data?.currentRound?.id;
      if (!roundId) throw new Error("Nenhuma rodada aberta.");
      return revealAnswer(matchId, roundId);
    },
    onSuccess: refresh,
    onError: (error) => toast.error(errorToMessage(error)),
  });
  const participantMutation = useMutation({
    mutationFn: (name: string) => addParticipant(matchId, name),
    onSuccess: async () => {
      setParticipantName("");
      await refresh();
      toast.success("Participante adicionado.");
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });
  const scoreMutation = useMutation({
    mutationFn: (input: { participantId: string; delta: number }) =>
      adjustScore(matchId, input.participantId, input.delta, "Ajuste pelo painel do anfitrião"),
    onSuccess: refresh,
    onError: (error) => toast.error(errorToMessage(error)),
  });
  const answerMutation = useMutation({
    mutationFn: (input: { result: "correct" | "incorrect" | "skipped" }) => {
      const round = query.data?.currentRound;
      if (!round) throw new Error("Nenhuma rodada aberta.");
      return registerAnswer(matchId, round.id, round.selectedParticipantId, input.result);
    },
    onSuccess: refresh,
    onError: (error) => toast.error(errorToMessage(error)),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </section>
          <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </section>
        </div>
      </div>
    );
  }
  if (query.isError || !query.data) throw notFound();

  const state = query.data;
  const match = state.match;
  const round = state.currentRound;
  const mode = state.settings.mode;
  const questionType = round?.question?.type ?? "buzzer";
  const selected = state.participants.find((player) => player.id === round?.selectedParticipantId);
  const remainingQuestions = state.questions.filter((question) => !question.used).length;
  const canStart = match.status === "aguardando" && state.participants.length > 0;
  const remoteEnabled = state.settings.remoteEnabled;
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const joinUrl = state.room?.pin
    ? `${origin}/entrar?pin=${state.room.pin}`
    : `${origin}/play/${matchId}`;

  function run(kind: "start" | "draw" | "end" | "reset" | "reveal", message: string) {
    action.mutate(kind, { onSuccess: () => toast.success(message) });
  }

  function submitParticipant() {
    const name = participantName.trim();
    if (!name) return;
    participantMutation.mutate(name);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{match.name}</h1>
            <MatchStatusBadge status={match.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{state.participants.length} participantes</span>
            <span>•</span>
            <span>{remainingQuestions} perguntas restantes</span>
            {remoteEnabled ? (
              <>
                {state.room && (
                  <>
                    <span>•</span>
                    <span>PIN {state.room.pin}</span>
                  </>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6"
                  onClick={() => {
                    navigator.clipboard?.writeText(joinUrl);
                    toast.success("Link de entrada copiado.");
                  }}
                >
                  <Copy className="size-3" />
                </Button>
              </>
            ) : (
              <>
                <span>•</span>
                <span className="font-medium text-amber-500">Participação remota desligada</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {remoteEnabled ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <QrCode className="mr-1 size-4" /> QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Entrar na partida</DialogTitle>
                  <DialogDescription>
                    Os jogadores escaneiam o código com a câmera do celular para entrar.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="rounded-2xl bg-white p-4">
                    <QRCodeSVG value={joinUrl} size={232} marginSize={1} />
                  </div>
                  {state.room?.pin && (
                    <p className="text-sm text-muted-foreground">
                      Ou use o PIN{" "}
                      <span className="font-semibold text-foreground">{state.room.pin}</span>
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => {
                      navigator.clipboard?.writeText(joinUrl);
                      toast.success("Link de entrada copiado.");
                    }}
                  >
                    <Copy className="mr-1 size-4" /> Copiar link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled
              title="Ative a participação remota para os jogadores entrarem pelo celular."
            >
              <QrCode className="mr-1 size-4" /> QR Code
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link to="/matches/$matchId/questions" params={{ matchId }}>
              <ListChecks className="mr-1 size-4" /> Perguntas
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <a href={`/matches/${matchId}/present`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 size-4" /> Apresentação
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Controles</p>
          <Button
            className="w-full rounded-lg"
            size="lg"
            disabled={action.isPending || !canStart}
            onClick={() => run("start", "Partida iniciada.")}
          >
            <Play className="mr-1 size-4" /> Iniciar partida
          </Button>
          <Button
            className="w-full rounded-lg"
            size="lg"
            variant="outline"
            disabled={action.isPending || match.status !== "em-andamento" || Boolean(round)}
            onClick={() => run("draw", "Pergunta sorteada.")}
          >
            <Shuffle className="mr-1 size-4" /> Sortear pergunta
          </Button>
          <Button
            className="w-full rounded-lg"
            variant="outline"
            disabled={action.isPending || !round || round.answerRevealed}
            onClick={() => run("reveal", "Resposta revelada.")}
          >
            <CheckCircle2 className="mr-1 size-4" /> Revelar resposta
          </Button>
          {mode === "buzzer" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="rounded-lg"
                disabled={answerMutation.isPending || !round}
                onClick={() => answerMutation.mutate({ result: "correct" })}
              >
                Correta
              </Button>
              <Button
                className="rounded-lg"
                variant="outline"
                disabled={answerMutation.isPending || !round}
                onClick={() => answerMutation.mutate({ result: "incorrect" })}
              >
                Incorreta
              </Button>
            </div>
          ) : (
            <Button
              className="w-full rounded-lg"
              variant="outline"
              disabled={answerMutation.isPending || !round}
              onClick={() => answerMutation.mutate({ result: "skipped" })}
            >
              Encerrar rodada
            </Button>
          )}
          <ConfirmDialog
            trigger={
              <Button
                className="w-full rounded-lg text-destructive hover:text-destructive"
                variant="outline"
                disabled={action.isPending || match.status === "encerrada"}
              >
                <StopCircle className="mr-1 size-4" /> Encerrar
              </Button>
            }
            title="Encerrar partida?"
            description="A partida será finalizada e o vencedor definido pelo placar atual. Esta ação não pode ser desfeita."
            confirmLabel="Encerrar"
            destructive
            onConfirm={() => run("end", "Partida encerrada.")}
          />
          <ConfirmDialog
            trigger={
              <Button className="w-full rounded-lg" variant="ghost" disabled={action.isPending}>
                <RotateCcw className="mr-1 size-4" /> Resetar
              </Button>
            }
            title="Resetar partida?"
            description="Rodadas, respostas e pontuações serão zeradas e a partida volta ao estado inicial. Esta ação não pode ser desfeita."
            confirmLabel="Resetar"
            destructive
            onConfirm={() => run("reset", "Partida resetada.")}
          />

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm font-semibold">Adicionar participante</p>
            <div className="flex gap-2">
              <Input
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitParticipant();
                }}
                placeholder="Nome"
              />
              <Button
                size="icon"
                className="shrink-0 rounded-lg"
                disabled={participantMutation.isPending || !participantName.trim()}
                onClick={submitParticipant}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rodada atual
            </p>
            {round?.question ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-semibold">{round.question.prompt}</h2>
                  {round.status === "open" && round.timeRemainingSeconds !== null && (
                    <RoundTimer
                      key={round.id}
                      initialSeconds={round.timeRemainingSeconds}
                      className="text-lg"
                      paused={Boolean(round.selectedParticipantId)}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Resposta:{" "}
                  <span className="font-medium text-foreground">
                    {questionType === "true_false"
                      ? round.question.expectedAnswer === "true"
                        ? "Verdadeiro"
                        : "Falso"
                      : round.question.expectedAnswer}
                  </span>
                </p>
                {mode === "buzzer" ? (
                  <p className="text-sm text-muted-foreground">
                    Selecionado:{" "}
                    <span className="font-medium text-foreground">
                      {selected?.displayName ?? "aguardando resposta"}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Os jogadores respondem pelo celular; o placar atualiza automaticamente.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {match.status === "aguardando"
                  ? "Inicie a partida para sortear a primeira pergunta."
                  : match.status === "encerrada"
                    ? "Partida encerrada."
                    : remainingQuestions === 0
                      ? "Todas as perguntas foram usadas. Encerre a partida ou adicione mais perguntas."
                      : "Sorteie a próxima pergunta para continuar."}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold">Placar</h2>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {state.participants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  mode={state.settings.mode}
                  early={Boolean(state.currentRound?.earlyParticipantIds.includes(participant.id))}
                  disabled={scoreMutation.isPending}
                  onAdjust={(delta) =>
                    scoreMutation.mutate({ participantId: participant.id, delta })
                  }
                />
              ))}
              {state.participants.length === 0 && (
                <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  Adicione participantes para iniciar a partida.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ParticipantRow({
  participant,
  mode,
  early,
  disabled,
  onAdjust,
}: {
  participant: MatchParticipant;
  mode: string;
  early: boolean;
  disabled: boolean;
  onAdjust: (delta: number) => void;
}) {
  const isElimination = mode === "elimination";
  return (
    <div
      className={
        "flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3" +
        (participant.eliminated || early ? " opacity-50" : "")
      }
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{participant.displayName}</span>
          {participant.eliminated && (
            <span className="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
              Eliminado
            </span>
          )}
          {early && !participant.eliminated && (
            <span className="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
              Fora (rodada)
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {participant.joinSource === "remote" ? "Remoto" : "Local"}
          {isElimination && participant.livesRemaining !== null && (
            <span className="ml-2 text-rose-500">
              {"♥".repeat(Math.max(0, participant.livesRemaining)) || "—"}
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="icon" variant="ghost" disabled={disabled} onClick={() => onAdjust(-50)}>
          <XCircle className="size-4" />
        </Button>
        <span className="w-16 text-right text-sm font-semibold tabular-nums">
          {participant.currentScore}
        </span>
        <Button size="icon" variant="ghost" disabled={disabled} onClick={() => onAdjust(50)}>
          <CheckCircle2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
