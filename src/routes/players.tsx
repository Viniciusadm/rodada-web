import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayersQuery } from "@/features/games-hub-data";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Jogadores — Games Hub" },
      { name: "description", content: "Jogadores participando do Games Hub." },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const { data: players = [], isLoading, isError } = usePlayersQuery();
  const [search, setSearch] = useState("");
  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return players;
    return players.filter((player) =>
      `${player.name} ${player.team}`.toLocaleLowerCase("pt-BR").includes(term),
    );
  }, [players, search]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Jogadores"
        description="Todos os jogadores ativos da sua comunidade registrados no Games Hub."
        actions={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar jogador..."
              className="h-10 rounded-lg pl-9"
            />
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[168px] rounded-2xl" />
          ))}
        {isError && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Não foi possível carregar os jogadores da API.
          </div>
        )}
        {!isLoading &&
          !isError &&
          filteredPlayers.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-full text-sm font-semibold ${p.color}`}
                >
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.team}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-sm font-semibold">{p.points.toLocaleString("pt-BR")}</p>
                  <p className="text-[11px] text-muted-foreground">Pontos</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{p.matches}</p>
                  <p className="text-[11px] text-muted-foreground">Partidas</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Nv. {p.level}</p>
                  <p className="text-[11px] text-muted-foreground">Nível</p>
                </div>
              </div>
            </div>
          ))}
        {!isLoading && !isError && filteredPlayers.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {players.length === 0 ? "Nenhum jogador cadastrado." : "Nenhum jogador encontrado."}
          </div>
        )}
      </div>
    </div>
  );
}
