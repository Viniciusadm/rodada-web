import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePlayer, useTeamsQuery, useUpdatePlayer } from "@/features/games-hub-data";
import type { Player } from "@/lib/api-client";

const NO_TEAM = "none";

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Informe o nome (mínimo 2 caracteres).")
    .max(140, "Nome muito longo."),
});

type Props = {
  mode: "create" | "edit";
  player?: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PlayerFormDialog({ mode, player, open, onOpenChange }: Props) {
  const { data: teams = [] } = useTeamsQuery();
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer();

  const [displayName, setDisplayName] = useState("");
  const [ministryId, setMinistryId] = useState<string>(NO_TEAM);
  const [error, setError] = useState<string | null>(null);

  // Reidrata o formulário sempre que abrir ou trocar o jogador em edição.
  useEffect(() => {
    if (!open) return;
    setDisplayName(player?.name ?? "");
    setMinistryId(player?.ministryId ?? NO_TEAM);
    setError(null);
  }, [open, player]);

  const submitting = createPlayer.isPending || updatePlayer.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse({ displayName });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }
    setError(null);
    const ministry = ministryId === NO_TEAM ? null : ministryId;

    try {
      if (mode === "create") {
        await createPlayer.mutateAsync({
          displayName: parsed.data.displayName,
          ministryId: ministry,
        });
        toast.success("Jogador cadastrado!");
      } else if (player) {
        await updatePlayer.mutateAsync({
          playerId: player.id,
          displayName: parsed.data.displayName,
          ministryId: ministry,
        });
        toast.success("Jogador atualizado!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo jogador" : "Editar jogador"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cadastre um jogador na sua comunidade."
              : "Atualize o nome e o time do jogador."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="player-name">Nome</Label>
            <Input
              id="player-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Nome do jogador"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="player-team">Time / ministério</Label>
            <Select value={ministryId} onValueChange={setMinistryId}>
              <SelectTrigger id="player-team">
                <SelectValue placeholder="Selecione um time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TEAM}>Sem time</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : mode === "create" ? (
                "Cadastrar"
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
