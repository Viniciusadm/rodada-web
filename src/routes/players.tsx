import { createFileRoute } from "@tanstack/react-router";
import { MoreVertical, Pencil, Power, PowerOff, PlusCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { PlayerFormDialog } from "@/components/player/PlayerFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayersQuery, useUpdatePlayer } from "@/features/games-hub-data";
import type { Player } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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
  const updatePlayer = useUpdatePlayer();

  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Player | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return players;
    return players.filter((player) => player.name.toLocaleLowerCase("pt-BR").includes(term));
  }, [players, search]);

  const openCreate = () => {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (player: Player) => {
    setDialogMode("edit");
    setEditing(player);
    setDialogOpen(true);
  };

  const toggleActive = async (player: Player) => {
    try {
      await updatePlayer.mutateAsync({ playerId: player.id, isActive: !player.isActive });
      toast.success(player.isActive ? "Jogador inativado." : "Jogador reativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Jogadores"
        description="Todos os jogadores da sua comunidade registrados no Games Hub."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar jogador..."
                className="h-10 rounded-lg pl-9"
              />
            </div>
            <Button className="rounded-lg" onClick={openCreate}>
              <PlusCircle className="mr-1 size-4" /> Novo jogador
            </Button>
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
            Não foi possível carregar os jogadores.
          </div>
        )}
        {!isLoading &&
          !isError &&
          filteredPlayers.map((p) => (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40",
                !p.isActive && "opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-full text-sm font-semibold ${p.color}`}
                >
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    {!p.isActive && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(p)}>
                      <Pencil className="size-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleActive(p)}>
                      {p.isActive ? (
                        <>
                          <PowerOff className="size-4" /> Inativar
                        </>
                      ) : (
                        <>
                          <Power className="size-4" /> Reativar
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <PlayerFormDialog
        mode={dialogMode}
        player={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
