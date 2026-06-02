import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateGame, useUpdateGame } from "@/features/games-hub-data";
import type { Game } from "@/lib/api-client";

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "beta", label: "Beta" },
  { value: "coming_soon", label: "Em breve" },
  { value: "maintenance", label: "Manutenção" },
];

/** Maps the frontend status union back to the backend's snake_case value. */
function toBackendStatus(status: Game["status"]): string {
  return status === "coming-soon" ? "coming_soon" : status;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  mode: "create" | "edit";
  game?: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GameFormDialog({ mode, game, open, onOpenChange }: Props) {
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(game?.name ?? "");
    setSlug(game?.slug ?? "");
    setDescription(game?.description ?? "");
    setStatus(game ? toBackendStatus(game.status) : "active");
    setSortOrder("0");
    setError(null);
  }, [open, game]);

  const submitting = createGame.isPending || updateGame.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (trimmedName.length < 2) {
      setError("Informe o nome do jogo (mínimo 2 caracteres).");
      return;
    }
    if (trimmedDescription.length < 2) {
      setError("Informe uma descrição.");
      return;
    }
    setError(null);
    try {
      if (mode === "create") {
        await createGame.mutateAsync({
          name: trimmedName,
          slug: slug.trim() || slugify(trimmedName),
          description: trimmedDescription,
          status,
          sortOrder: Number(sortOrder) || 0,
        });
        toast.success("Jogo criado!");
      } else if (game) {
        await updateGame.mutateAsync({
          gameId: game.id,
          name: trimmedName,
          description: trimmedDescription,
          status,
          sortOrder: Number(sortOrder) || 0,
        });
        toast.success("Jogo atualizado!");
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
          <DialogTitle>{mode === "create" ? "Novo jogo" : "Editar jogo"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Adicione um jogo ao catálogo da sua organização."
              : "Atualize os dados do jogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="game-name">Nome</Label>
            <Input
              id="game-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (mode === "create") setSlug(slugify(event.target.value));
              }}
              placeholder="Nome do jogo"
              autoFocus
            />
          </div>

          {mode === "create" && (
            <div className="space-y-1.5">
              <Label htmlFor="game-slug">Identificador (slug)</Label>
              <Input
                id="game-slug"
                value={slug}
                onChange={(event) => setSlug(slugify(event.target.value))}
                placeholder="quiz-biblico"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="game-description">Descrição</Label>
            <Textarea
              id="game-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Como o jogo funciona"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="game-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="game-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="game-sort">Ordem</Label>
              <Input
                id="game-sort"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>
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
                "Criar"
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
