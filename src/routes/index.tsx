import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PlusCircle, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/games/GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLanding } from "@/components/landing/PublicLanding";
import { useGamesQuery, useRankingQuery } from "@/features/games-hub-data";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Games Hub — Plataforma de jogos" },
      {
        name: "description",
        content:
          "Jogos interativos. Crie partidas ao vivo, engaje participantes e acompanhe rankings.",
      },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const status = useAuthStore((s) => s.status);
  if (status === "authed") {
    return <Dashboard />;
  }
  return <PublicLanding />;
}

function Dashboard() {
  const { data: games = [], isLoading: gamesLoading } = useGamesQuery();
  const { data: ranking = [], isLoading: rankingLoading } = useRankingQuery();
  const featured = games.slice(0, 6);
  const top3 = ranking.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 size-64 rounded-full bg-primary-glow/15 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Bem-vindo de volta
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Pronto para começar uma partida?
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Crie uma partida, compartilhe o link único e reúna os participantes em segundos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/matches/new">
                <PlusCircle className="mr-2 size-4" /> Nova partida
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/matches">Ver partidas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Jogos disponíveis</h2>
            <p className="text-sm text-muted-foreground">
              Escolha uma experiência para começar agora.
            </p>
          </div>
          <Link
            to="/games"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex sm:items-center"
          >
            Ver todos <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {gamesLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[218px] rounded-2xl" />
            ))}
          {!gamesLoading && featured.map((g) => <GameCard key={g.id} game={g} />)}
          {!gamesLoading && featured.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Nenhum jogo disponível.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" />
              <h2 className="text-base font-semibold">Ranking do mês</h2>
            </div>
            <Link to="/ranking" className="text-xs font-medium text-primary hover:underline">
              Ver completo
            </Link>
          </div>
          <ul className="space-y-3">
            {rankingLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[60px] rounded-xl" />
              ))}
            {top3.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-base font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${p.color}`}
                  >
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {p.points.toLocaleString("pt-BR")}{" "}
                  <span className="text-xs text-muted-foreground">pts</span>
                </span>
              </li>
            ))}
            {!rankingLoading && top3.length === 0 && (
              <li className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Ranking ainda sem pontuação.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
