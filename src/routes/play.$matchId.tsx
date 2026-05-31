import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hand, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMatchState, joinMatch, sendPlayerAnswer } from "@/lib/api-client";

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
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
    refetchInterval: 1500,
  });
  const joinMutation = useMutation({
    mutationFn: () => joinMatch(matchId, name.trim()),
    onSuccess: async (result) => {
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
    onError: (error) => toast.error(error.message),
  });
  const answerMutation = useMutation({
    mutationFn: async () => {
      const round = query.data?.currentRound;
      if (!round || !token) throw new Error("Não há pergunta aberta para responder.");
      return sendPlayerAnswer(matchId, round.id, token);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
      toast.success(result.accepted ? "Resposta enviada." : "Alguém respondeu antes.");
    },
    onError: (error) => toast.error(error.message),
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

  if (query.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando partida...</div>;
  }
  if (query.isError || !query.data) throw notFound();

  const state = query.data;
  const match = state.match;
  const round = state.currentRound;
  const participant = state.participants.find((item) => item.id === participantId);
  const selected = state.participants.find((item) => item.id === round?.selectedParticipantId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 px-6 text-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-xl shadow-primary/30">
          <Sparkles className="size-7 text-primary-foreground" />
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
            </div>

            {round?.question ? (
              <div className="space-y-4">
                <p className="text-lg font-semibold">{round.question.prompt}</p>
                {round.answerRevealed && (
                  <p className="rounded-lg bg-muted/40 p-3 text-sm">
                    {round.question.expectedAnswer}
                  </p>
                )}
                <Button
                  className="h-24 w-24 rounded-full text-base"
                  disabled={answerMutation.isPending || Boolean(round.selectedParticipantId)}
                  onClick={() => answerMutation.mutate()}
                >
                  <Hand className="mr-1 size-5" /> Eu sei
                </Button>
                {selected && (
                  <p className="text-sm text-muted-foreground">
                    {selected.id === participantId
                      ? "Sua resposta foi recebida."
                      : `${selected.displayName} respondeu primeiro.`}
                  </p>
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
