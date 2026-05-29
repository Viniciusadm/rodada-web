import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchStore } from "@/lib/match-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$matchId")({
  head: () => ({
    meta: [{ title: "Jogar — HolyPlay" }],
  }),
  component: PlayPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function PlayPage() {
  const { matchId } = Route.useParams();
  const match = useMatchStore((s) => s.matches[matchId]);
  const addPlayer = useMatchStore((s) => s.addPlayer);
  const buzzIn = useMatchStore((s) => s.buzzIn);

  const [name, setName] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [armed, setArmed] = useState(false);

  // re-arm buzzer when new question
  useEffect(() => {
    if (!match?.currentQuestionId) {
      setArmed(false);
      setCountdown(3);
      return;
    }
    setArmed(false);
    setCountdown(3);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setArmed(true);
          return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => clearInterval(t);
  }, [match?.currentQuestionId]);

  if (!match) throw notFound();

  const me = playerId ? match.players.find((p) => p.id === playerId) : null;
  const currentQ = match.currentQuestionId
    ? match.questions.find((q) => q.id === match.currentQuestionId)
    : null;
  const isMyTurn = match.currentPlayerId === playerId;
  const isEliminated = me?.eliminatedThisRound;

  // Step 1: join
  if (!me) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-xl shadow-primary/30">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              HolyPlay
            </p>
            <h1 className="text-xl font-semibold">{match.name}</h1>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
          <p className="mb-1 text-sm text-muted-foreground">PIN da partida</p>
          <p className="mb-5 font-mono text-2xl font-bold tracking-widest text-primary">
            {match.joinPin}
          </p>
          <label className="mb-2 block text-sm font-medium">Seu nome</label>
          <Input
            placeholder="Ex.: João"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const p = addPlayer(matchId, name, true);
                if (p) setPlayerId(p.id);
              }
            }}
          />
          <Button
            className="mt-3 w-full rounded-lg"
            size="lg"
            disabled={!name.trim()}
            onClick={() => {
              const p = addPlayer(matchId, name, true);
              if (p) setPlayerId(p.id);
            }}
          >
            Entrar na partida
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: waiting
  if (match.status === "aguardando") {
    return (
      <PlayerShell name={me.name} score={me.score}>
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-pulse rounded-full bg-primary/20" />
          <p className="text-xl font-semibold">Aguardando o anfitrião iniciar...</p>
          <p className="mt-2 text-sm text-muted-foreground">{match.players.length} jogadores na sala</p>
        </div>
      </PlayerShell>
    );
  }

  // Step 3: ended
  if (match.status === "encerrada") {
    const ranking = [...match.players].sort((a, b) => b.score - a.score);
    const myPos = ranking.findIndex((p) => p.id === me.id) + 1;
    return (
      <PlayerShell name={me.name} score={me.score}>
        <div className="text-center">
          <Trophy className="mx-auto mb-3 size-14 text-primary" />
          <p className="text-2xl font-bold">Partida encerrada!</p>
          <p className="mt-2 text-lg">
            Você terminou em <span className="font-bold text-primary">{myPos}º lugar</span>
          </p>
        </div>
      </PlayerShell>
    );
  }

  // Step 3: playing
  return (
    <PlayerShell name={me.name} score={me.score}>
      {!currentQ ? (
        <p className="text-center text-lg text-muted-foreground">
          Aguardando próxima pergunta...
        </p>
      ) : (
        <div className="flex w-full flex-col items-center">
          <p className="mb-6 text-center text-lg font-medium">{currentQ.text}</p>

          {isMyTurn ? (
            <BuzzerVisual
              label="Sua vez de responder!"
              color="bg-success"
              disabled
            />
          ) : isEliminated ? (
            <BuzzerVisual label="Eliminado nesta rodada" color="bg-muted" disabled />
          ) : !armed ? (
            <BuzzerVisual
              label={`Aguarde... ${countdown}`}
              color="bg-warning"
              disabled
              onClick={() => {
                buzzIn(matchId, me.id, true);
              }}
            />
          ) : match.currentPlayerId ? (
            <BuzzerVisual
              label={
                match.players.find((p) => p.id === match.currentPlayerId)?.name +
                " respondendo..."
              }
              color="bg-muted"
              disabled
            />
          ) : (
            <BuzzerVisual
              label="PRESSIONE!"
              color="bg-primary"
              onClick={() => buzzIn(matchId, me.id, false)}
            />
          )}
        </div>
      )}
    </PlayerShell>
  );
}

function PlayerShell({
  name,
  score,
  children,
}: {
  name: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-primary/10">
      <header className="flex items-center justify-between border-b border-border bg-card/60 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-xs font-semibold text-primary">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-sm font-medium">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pontos</p>
          <p className="text-lg font-bold tabular-nums text-primary">{score}</p>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">{children}</div>
    </div>
  );
}

function BuzzerVisual({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "flex size-60 items-center justify-center rounded-full text-lg font-bold uppercase tracking-wider text-white shadow-2xl transition-all",
          color,
          !disabled && "hover:scale-105 active:scale-95 shadow-primary/40",
          disabled && "opacity-70 cursor-not-allowed",
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Hand className="size-10" />
          <span className="px-4 text-center text-sm leading-tight">{label}</span>
        </div>
      </button>
    </div>
  );
}
