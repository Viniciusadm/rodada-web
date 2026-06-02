import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Layers, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { GameFormDialog } from "@/components/games/GameFormDialog";
import { GameModesDialog } from "@/components/games/GameModesDialog";
import { useAdminGamesQuery, useArchiveGame } from "@/features/games-hub-data";
import { useCanManageOrg } from "@/hooks/use-active-role";
import type { Game } from "@/lib/api-client";

export const Route = createFileRoute("/create-game")({
  head: () => ({
    meta: [{ title: "Gerenciar jogos — Games Hub" }],
  }),
  component: ManageGamesPage,
});

const STATUS_LABELS: Record<Game["status"], string> = {
  active: "Ativo",
  beta: "Beta",
  maintenance: "Manutenção",
  "coming-soon": "Em breve",
  archived: "Arquivado",
};

function ManageGamesPage() {
  const canManage = useCanManageOrg();
  const { data: games = [], isLoading, isError } = useAdminGamesQuery();
  const archiveGame = useArchiveGame();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [modesGame, setModesGame] = useState<Game | null>(null);
  const [toArchive, setToArchive] = useState<Game | null>(null);

  if (!canManage) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Gerenciar jogos" description="Catálogo de jogos da organização." />
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Apenas administradores podem gerenciar o catálogo de jogos.
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link to="/games">
                <ArrowLeft className="mr-1 size-4" /> Voltar para a biblioteca
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function openCreate() {
    setFormMode("create");
    setActiveGame(null);
    setFormOpen(true);
  }

  function openEdit(game: Game) {
    setFormMode("edit");
    setActiveGame(game);
    setFormOpen(true);
  }

  async function confirmArchive() {
    if (!toArchive) return;
    try {
      await archiveGame.mutateAsync(toArchive.id);
      toast.success("Jogo arquivado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível arquivar.");
    } finally {
      setToArchive(null);
    }
  }

  // Keep the modes dialog in sync with refreshed data after a mutation.
  const modesGameLive = modesGame ? (games.find((g) => g.id === modesGame.id) ?? modesGame) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Gerenciar jogos"
        description="Crie, edite e organize os jogos do catálogo da sua organização."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/games">
                <ArrowLeft className="mr-1 size-4" /> Biblioteca
              </Link>
            </Button>
            <Button className="rounded-xl" onClick={openCreate}>
              <PlusCircle className="mr-2 size-4" /> Novo jogo
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        {isError && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Não foi possível carregar os jogos.
          </div>
        )}
        {!isLoading &&
          !isError &&
          games.map((game) => {
            const editable = game.organizationId != null;
            return (
              <div
                key={game.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{game.name}</h3>
                    <Badge variant="outline">{STATUS_LABELS[game.status]}</Badge>
                    {!editable && <Badge variant="secondary">Catálogo global</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {game.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{game.modes.length} modos</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="outline" onClick={() => setModesGame(game)}>
                    <Layers className="mr-1 size-4" /> Modos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!editable}
                    onClick={() => openEdit(game)}
                  >
                    <Pencil className="mr-1 size-4" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={!editable}
                    onClick={() => setToArchive(game)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        {!isLoading && !isError && games.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum jogo no catálogo. Crie o primeiro.
          </div>
        )}
      </div>

      <GameFormDialog
        mode={formMode}
        game={activeGame}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      {modesGameLive && (
        <GameModesDialog
          game={modesGameLive}
          open={modesGame != null}
          onOpenChange={(open) => !open && setModesGame(null)}
        />
      )}

      <AlertDialog open={toArchive != null} onOpenChange={(open) => !open && setToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar “{toArchive?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O jogo sairá da biblioteca pública. As partidas já criadas continuam intactas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} disabled={archiveGame.isPending}>
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
