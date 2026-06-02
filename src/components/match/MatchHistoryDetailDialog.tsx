import { Clock, Gamepad2, Trophy, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MatchSummary } from "@/lib/api-client";
import { formatDateTime, formatDuration } from "@/lib/utils";

type Props = {
  match: MatchSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MatchHistoryDetailDialog({ match, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {match && (
          <>
            <DialogHeader>
              <DialogTitle>{match.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <Gamepad2 className="size-3.5" /> {match.gameName} · {match.modeName}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
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
