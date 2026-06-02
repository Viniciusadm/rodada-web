import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { GameCard } from "@/components/games/GameCard";
import { useGamesQuery } from "@/features/games-hub-data";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Jogos — Games Hub" },
      {
        name: "description",
        content: "Biblioteca completa de jogos disponíveis no Games Hub.",
      },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { data: games = [], isLoading, isError } = useGamesQuery();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Biblioteca de jogos"
        description="Todos os jogos prontos para usar com sua comunidade, sala ou time."
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[218px] rounded-2xl" />
          ))}
        {isError && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Não foi possível carregar os jogos.
          </div>
        )}
        {!isLoading && !isError && games.map((g) => <GameCard key={g.id} game={g} />)}
        {!isLoading && !isError && games.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum jogo disponível.
          </div>
        )}
      </div>
    </div>
  );
}
