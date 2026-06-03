import {
  CheckCircle2,
  Clock,
  Gamepad2,
  Layers,
  MinusCircle,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchRoundsQuery } from "@/features/games-hub-data";
import type { MatchRoundAnswer, MatchSummary } from "@/lib/api-client";
import { formatDateTime, formatDuration } from "@/lib/utils";

type Props = {
  match: MatchSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MatchHistoryDetailDialog({ match, open, onOpenChange }: Props) {
  const rounds = useMatchRoundsQuery(match?.id ?? null, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        {match && (
          <>
            <DialogHeader>
              <DialogTitle>{match.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <Gamepad2 className="size-3.5" /> {match.modeLabel} · {match.scoringModeLabel}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Início" value={formatDateTime(match.startedAt)} />
              <Field label="Fim" value={formatDateTime(match.endedAt)} />
              <Field
                label="Duração"
                value={formatDuration(match.durationSeconds)}
                icon={<Clock className="size-3.5" />}
              />
              <Field
                label="Participantes"
                value={String(match.participantCount)}
                icon={<Users className="size-3.5" />}
              />
              <Field
                label="Rodadas"
                value={String(match.roundsPlayed)}
                icon={<Layers className="size-3.5" />}
              />
            </dl>

            <div className="rounded-xl bg-primary/10 px-4 py-3 ring-1 ring-primary/20">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Trophy className="size-3.5 text-primary" /> Vencedor
              </p>
              <p className="mt-1 text-sm font-medium">
                {match.winnerName
                  ? `${match.winnerName} · ${match.winnerScore ?? 0} pts`
                  : "Sem vencedor"}
              </p>
            </div>

            {match.topScores.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Placar final
                </p>
                <ol className="space-y-1.5">
                  {match.topScores.map((score, index) => (
                    <li
                      key={score.participantId}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 text-center font-semibold tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        {score.displayName}
                      </span>
                      <span className="font-semibold tabular-nums">{score.score} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rodadas
              </p>
              {rounds.isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 rounded-lg" />
                  ))}
                </div>
              )}
              {rounds.isError && (
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar as rodadas.
                </p>
              )}
              {!rounds.isLoading && !rounds.isError && (rounds.data?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma rodada registrada.</p>
              )}
              {!rounds.isLoading && !rounds.isError && (rounds.data?.length ?? 0) > 0 && (
                <ol className="space-y-2">
                  {rounds.data?.map((round) => (
                    <li key={round.roundNumber} className="rounded-lg bg-muted/40 p-3 text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">
                          Rodada {round.roundNumber}
                          {round.prompt ? ` · ${round.prompt}` : ""}
                        </span>
                      </div>
                      {round.answers.length > 0 ? (
                        <ul className="mt-1.5 space-y-1">
                          {round.answers.map((answer, index) => (
                            <li
                              key={`${round.roundNumber}-${answer.participantId ?? index}`}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                              <ResultIcon result={answer.result} />
                              <span className="text-foreground">
                                {answer.displayName ?? "Participante"}
                              </span>
                              {answer.pointsApplied !== 0 && (
                                <span className="tabular-nums">
                                  ({answer.pointsApplied > 0 ? "+" : ""}
                                  {answer.pointsApplied} pts)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">Sem respostas.</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultIcon({ result }: { result: MatchRoundAnswer["result"] }) {
  if (result === "correct") return <CheckCircle2 className="size-3.5 text-emerald-500" />;
  if (result === "incorrect") return <XCircle className="size-3.5 text-rose-500" />;
  return <MinusCircle className="size-3.5 text-muted-foreground" />;
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
