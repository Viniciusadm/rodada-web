import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Play,
  Shuffle,
  StopCircle,
  RotateCcw,
  ExternalLink,
  ListChecks,
  Check,
  X,
  Trash2,
  Plus,
  Minus,
  Users,
  Trophy,
  Copy,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { useMatchStore, getModeLabel } from "@/lib/match-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches/$matchId/host")({
  head: () => ({
    meta: [{ title: "Painel do anfitrião — HolyPlay" }],
  }),
  component: HostPanel,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function HostPanel() {
  const { matchId } = Route.useParams();
  const match = useMatchStore((s) => s.matches[matchId]);
  const addPlayer = useMatchStore((s) => s.addPlayer);
  const removePlayer = useMatchStore((s) => s.removePlayer);
  const applyPenalty = useMatchStore((s) => s.applyPenalty);
  const startMatch = useMatchStore((s) => s.startMatch);
  const drawQuestion = useMatchStore((s) => s.drawQuestion);
  const selectPlayer = useMatchStore((s) => s.selectPlayer);
  const registerAnswer = useMatchStore((s) => s.registerAnswer);
  const revealAnswer = useMatchStore((s) => s.revealAnswer);
  const endMatch = useMatchStore((s) => s.endMatch);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const resetBuzzers = useMatchStore((s) => s.resetBuzzers);

  const [playerName, setPlayerName] = useState("");

  if (!match) throw notFound();

  const currentQ = match.currentQuestionId
    ? match.questions.find((q) => q.id === match.currentQuestionId)
    : null;
  const currentPlayer = match.currentPlayerId
    ? match.players.find((p) => p.id === match.currentPlayerId)
    : null;
  const remaining = match.questions.filter((q) => !q.used).length;
  const used = match.questions.length - remaining;
  const ranking = [...match.players].sort((a, b) => b.score - a.score);

  function handleStart() {
    if (match.players.length === 0) {
      toast.error("Adicione pelo menos um jogador para iniciar.");
      return;
    }
    if (match.questions.length === 0) {
      toast.error("Cadastre pelo menos uma pergunta.");
      return;
    }
    startMatch(matchId);
    toast.success("Partida iniciada!");
  }

  function handleDraw() {
    const q = drawQuestion(matchId);
    if (!q) {
      toast.info("Não há mais perguntas disponíveis.");
      return;
    }
    toast.success("Pergunta sorteada.");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{match.name}</h1>
            <MatchStatusBadge status={match.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Modo: <span className="text-foreground">{getModeLabel(match.mode)}</span></span>
            <span>•</span>
            <span>
              PIN: <span className="font-mono text-base font-semibold tracking-wider text-foreground">{match.joinPin}</span>
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => {
                navigator.clipboard?.writeText(match.joinPin);
                toast.success("PIN copiado.");
              }}
            >
              <Copy className="size-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link to="/matches/$matchId/questions" params={{ matchId }}>
              <ListChecks className="mr-1 size-4" /> Perguntas
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <a
              href={`/matches/${matchId}/present`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-1 size-4" /> Apresentação
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* LEFT: control */}
        <div className="space-y-4">
          {/* Players */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Jogadores ({match.players.length})</p>
              </div>
            </div>

            {match.remoteEnabled ? (
              <p className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Participação remota ativa. Compartilhe o PIN ou o link <code>/play/{matchId}</code>.
              </p>
            ) : (
              <div className="mb-3 flex gap-2">
                <Input
                  placeholder="Nome do jogador"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const p = addPlayer(matchId, playerName);
                      if (p) {
                        setPlayerName("");
                        toast.success(`${p.name} entrou.`);
                      } else toast.error("Nome inválido ou já em uso.");
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="rounded-lg"
                  onClick={() => {
                    const p = addPlayer(matchId, playerName);
                    if (p) {
                      setPlayerName("");
                      toast.success(`${p.name} entrou.`);
                    } else toast.error("Nome inválido ou já em uso.");
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              {match.players.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Aguardando jogadores...
                </p>
              )}
              {ranking.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-transparent bg-muted/30 p-2",
                    currentPlayer?.id === p.id && "border-primary/50 bg-primary/10",
                  )}
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-[10px] tabular-nums text-muted-foreground">
                      {p.score} pts {p.remote && "• remoto"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 text-muted-foreground"
                    onClick={() => applyPenalty(matchId, p.id, 50)}
                    title="+50"
                  >
                    <Plus className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 text-muted-foreground"
                    onClick={() => applyPenalty(matchId, p.id, -50)}
                    title="−50 (penalidade)"
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removePlayer(matchId, p.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <p className="mb-2 text-sm font-semibold">Controles</p>
            {match.status === "aguardando" && (
              <Button className="w-full rounded-lg" size="lg" onClick={handleStart}>
                <Play className="mr-1 size-4" /> Iniciar partida
              </Button>
            )}
            {match.status === "em-andamento" && (
              <>
                <Button
                  className="w-full rounded-lg"
                  size="lg"
                  onClick={handleDraw}
                  disabled={!!currentQ && !match.answerRevealed}
                >
                  <Shuffle className="mr-1 size-4" /> Sortear pergunta
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => {
                      resetBuzzers(matchId);
                      toast.success("Buzzers liberados.");
                    }}
                  >
                    <RotateCcw className="mr-1 size-4" /> Buzzers
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg text-destructive hover:text-destructive"
                    onClick={() => {
                      endMatch(matchId);
                      toast.success("Partida encerrada.");
                    }}
                  >
                    <StopCircle className="mr-1 size-4" /> Encerrar
                  </Button>
                </div>
              </>
            )}
            <Button
              variant="ghost"
              className="w-full rounded-lg text-muted-foreground"
              onClick={() => {
                if (confirm("Resetar a partida?")) {
                  resetMatch(matchId);
                  toast.success("Partida resetada.");
                }
              }}
            >
              <RotateCcw className="mr-1 size-4" /> Resetar partida
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
            <p>
              Perguntas: <span className="font-semibold text-foreground">{used}</span> usadas /{" "}
              <span className="font-semibold text-foreground">{match.questions.length}</span> total
              {match.maxQuestions && ` (limite ${match.maxQuestions})`}
            </p>
          </div>
        </div>

        {/* RIGHT: current round */}
        <div className="space-y-4">
          {match.status === "encerrada" ? (
            <FinalRanking ranking={ranking} />
          ) : !currentQ ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <Shuffle className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="text-base font-semibold">
                {match.status === "aguardando"
                  ? "Aguardando início da partida"
                  : "Nenhuma pergunta sorteada"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {match.status === "aguardando"
                  ? "Adicione jogadores e clique em Iniciar partida."
                  : "Use o botão Sortear pergunta no painel ao lado."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pergunta atual
                </span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {currentQ.points} pontos
                </span>
              </div>
              <h2 className="text-2xl font-semibold leading-tight md:text-3xl">{currentQ.text}</h2>

              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resposta esperada
                </p>
                {match.answerRevealed ? (
                  <p className="text-xl font-semibold text-success">{currentQ.answer}</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Oculta</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => revealAnswer(matchId)}
                    >
                      <Eye className="mr-1 size-3.5" /> Revelar
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Quem responde?</p>
                {currentPlayer ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Jogador da vez</p>
                      <p className="text-lg font-semibold">{currentPlayer.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => selectPlayer(matchId, "")}
                    >
                      Trocar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {match.players
                      .filter((p) => !p.eliminatedThisRound)
                      .map((p) => (
                        <Button
                          key={p.id}
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => selectPlayer(matchId, p.id)}
                        >
                          {p.name}
                        </Button>
                      ))}
                    {match.remoteEnabled && (
                      <span className="text-xs text-muted-foreground">
                        ou aguarde alguém pressionar o buzzer...
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6">
                <Button
                  size="lg"
                  className="rounded-lg bg-success text-success-foreground hover:bg-success/90"
                  disabled={!currentPlayer}
                  onClick={() => {
                    registerAnswer(matchId, true);
                    toast.success("Acertou! Pontos creditados.");
                  }}
                >
                  <Check className="mr-1 size-5" /> Acertou
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    registerAnswer(matchId, false);
                    toast.info("Resposta registrada como incorreta.");
                  }}
                >
                  <X className="mr-1 size-5" /> Errou
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinalRanking({
  ranking,
}: {
  ranking: ReturnType<typeof useMatchStore.getState>["matches"][string]["players"];
}) {
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 text-center">
        <Trophy className="mx-auto mb-2 size-10 text-primary" />
        <h2 className="text-2xl font-semibold">Ranking final</h2>
        <p className="text-sm text-muted-foreground">Partida encerrada</p>
      </div>

      {podium.length > 0 && (
        <div className="mb-6 grid grid-cols-3 items-end gap-3">
          {[1, 0, 2].map((idx) => {
            const p = podium[idx];
            if (!p) return <div key={idx} />;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = [
              "bg-zinc-500/30 text-zinc-300",
              "bg-primary/30 text-primary",
              "bg-amber-700/30 text-amber-400",
            ];
            const ranks = ["2º", "1º", "3º"];
            const order = [0, 1, 2].indexOf(idx);
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{p.score} pts</p>
                <div
                  className={cn(
                    "flex w-full items-center justify-center rounded-t-xl text-2xl font-bold",
                    heights[order],
                    colors[order],
                  )}
                >
                  {ranks[order]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-1.5">
          {rest.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
            >
              <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
                {i + 4}º
              </span>
              <span className="flex-1 text-sm font-medium">{p.name}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{p.score} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
