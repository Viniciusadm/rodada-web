import { createFileRoute, notFound } from "@tanstack/react-router";
import { Sparkles, Users, Trophy } from "lucide-react";
import { useMatchStore } from "@/lib/match-store";
import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches/$matchId/present")({
  head: () => ({
    meta: [{ title: "Apresentação — HolyPlay" }],
  }),
  component: PresentPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function PresentPage() {
  const { matchId } = Route.useParams();
  const match = useMatchStore((s) => s.matches[matchId]);

  if (!match) throw notFound();

  const currentQ = match.currentQuestionId
    ? match.questions.find((q) => q.id === match.currentQuestionId)
    : null;
  const currentPlayer = match.currentPlayerId
    ? match.players.find((p) => p.id === match.currentPlayerId)
    : null;
  const ranking = [...match.players].sort((a, b) => b.score - a.score);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_/_0.15,_transparent_50%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col p-8">
        {/* Header */}
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

        {/* Body */}
        <div className="flex flex-1 flex-col gap-8 lg:flex-row">
          <main className="flex flex-1 items-center justify-center">
            {match.status === "encerrada" ? (
              <FinalView ranking={ranking} />
            ) : match.status === "aguardando" ? (
              <WaitingView pin={match.joinPin} remote={match.remoteEnabled} count={match.players.length} />
            ) : !currentQ ? (
              <div className="text-center">
                <p className="text-3xl font-semibold text-muted-foreground">
                  Aguardando próxima pergunta...
                </p>
              </div>
            ) : (
              <div className="w-full max-w-3xl text-center">
                <p className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1 text-sm font-semibold text-primary">
                  {currentQ.points} pontos
                </p>
                <h2 className="mb-8 text-4xl font-semibold leading-tight md:text-6xl">
                  {currentQ.text}
                </h2>
                {match.answerRevealed && (
                  <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-success/30 bg-success/10 p-8 duration-500">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-success">
                      Resposta
                    </p>
                    <p className="text-4xl font-bold text-success">{currentQ.answer}</p>
                  </div>
                )}
                {currentPlayer && !match.answerRevealed && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6">
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">
                      Jogador da vez
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-primary">{currentPlayer.name}</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Scoreboard */}
          {match.status !== "encerrada" && match.players.length > 0 && (
            <aside className="w-full rounded-2xl border border-border bg-card/60 p-5 backdrop-blur lg:w-80">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="size-4 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wider">Placar</p>
              </div>
              <div className="space-y-1.5">
                {ranking.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg bg-muted/30 p-2.5",
                      currentPlayer?.id === p.id && "bg-primary/15 ring-1 ring-primary/40",
                    )}
                  >
                    <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function WaitingView({ pin, remote, count }: { pin: string; remote: boolean; count: number }) {
  return (
    <div className="text-center">
      <p className="mb-4 text-lg uppercase tracking-widest text-muted-foreground">
        Aguardando início
      </p>
      {remote ? (
        <>
          <p className="mb-2 text-sm text-muted-foreground">Entre em holyplay.app/play com o PIN</p>
          <p className="my-6 font-mono text-7xl font-bold tracking-[0.3em] text-primary md:text-9xl">
            {pin}
          </p>
        </>
      ) : (
        <p className="my-6 text-3xl font-semibold">A partida começará em instantes</p>
      )}
      <p className="flex items-center justify-center gap-2 text-base text-muted-foreground">
        <Users className="size-4" /> {count} jogador{count === 1 ? "" : "es"} conectado{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function FinalView({
  ranking,
}: {
  ranking: ReturnType<typeof useMatchStore.getState>["matches"][string]["players"];
}) {
  return (
    <div className="w-full max-w-2xl text-center">
      <Trophy className="mx-auto mb-4 size-16 text-primary" />
      <h2 className="mb-2 text-4xl font-bold">Partida encerrada!</h2>
      {ranking[0] && (
        <p className="mb-8 text-xl text-muted-foreground">
          🏆 Campeão: <span className="font-semibold text-foreground">{ranking[0].name}</span>
        </p>
      )}
      <div className="space-y-2">
        {ranking.slice(0, 5).map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-4 rounded-xl bg-card p-4",
              i === 0 && "ring-2 ring-primary",
            )}
          >
            <span className="text-2xl font-bold text-muted-foreground">{i + 1}º</span>
            <span className="flex-1 text-left text-lg font-medium">{p.name}</span>
            <span className="text-xl font-bold tabular-nums text-primary">{p.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
