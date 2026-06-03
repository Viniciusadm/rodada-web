import { createFileRoute } from "@tanstack/react-router";
import { Crown, Medal, Trophy } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useRankingQuery } from "@/features/games-hub-data";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — Games Hub" },
      { name: "description", content: "Os jogadores mais engajados da sua comunidade." },
    ],
  }),
  component: RankingPage,
});

const podiumIcons = [Crown, Trophy, Medal];
const podiumColors = ["text-amber-400", "text-slate-300", "text-orange-400"];

function RankingPage() {
  const { data: ranking = [], isLoading, isError } = useRankingQuery();
  const [first, second, third, ...rest] = ranking;
  const podium = [second, first, third].filter(Boolean); // 2-1-3 visual order

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Ranking geral"
        description="Os jogadores que mais pontuaram este mês no Games Hub."
      />

      {/* Podium */}
      <div className="mb-10 grid grid-cols-3 items-end gap-3 md:gap-6">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-t-xl" />
          ))}
        {podium.map((p, idx) => {
          const place = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const Icon = podiumIcons[place - 1];
          const heights = ["h-32", "h-44", "h-24"];
          return (
            <div key={p.id} className="flex flex-col items-center">
              <div
                className={`mb-2 flex size-14 items-center justify-center rounded-full text-sm font-semibold ${p.color}`}
              >
                {p.initials}
              </div>
              <p className="text-center text-sm font-medium leading-tight">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.points.toLocaleString("pt-BR")} pts
              </p>
              <div
                className={`mt-3 flex w-full ${heights[idx]} flex-col items-center justify-start rounded-t-xl border border-border bg-card pt-3`}
              >
                <Icon className={`size-6 ${podiumColors[place - 1]}`} />
                <span className="mt-1 text-2xl font-bold">{place}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[40px_1fr_120px_100px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>#</span>
          <span>Jogador</span>
          <span className="text-right">Partidas</span>
          <span className="text-right">Pontos</span>
        </div>
        {isError && (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            Não foi possível carregar o ranking.
          </div>
        )}
        {!isLoading && !isError && ranking.length === 0 && (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            Ranking ainda sem pontuação.
          </div>
        )}
        {!isLoading &&
          !isError &&
          rest.map((p, i) => (
            <div
              key={p.id}
              className="grid grid-cols-[40px_1fr_120px_100px] items-center gap-4 border-b border-border/60 px-5 py-3 last:border-0 hover:bg-muted/30"
            >
              <span className="font-mono text-sm text-muted-foreground">{i + 4}</span>
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${p.color}`}
                >
                  {p.initials}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{p.name}</p>
                </div>
              </div>
              <span className="text-right text-sm tabular-nums text-muted-foreground">
                {p.matches}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums">
                {p.points.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
