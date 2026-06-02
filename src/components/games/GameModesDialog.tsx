import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useArchiveGameMode,
  useCreateGameMode,
  useUpdateGameMode,
} from "@/features/games-hub-data";
import type { Game, GameModeOption } from "@/lib/api-client";

const CODE_LABELS: Record<string, string> = {
  classic: "Clássico",
  initial_points: "Pontos iniciais",
  elimination: "Eliminação",
};

const CODE_OPTIONS = Object.entries(CODE_LABELS).map(([value, label]) => ({ value, label }));

type Props = {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Draft = {
  name: string;
  code: string;
  initialPoints: string;
  timePerQuestion: string;
  isActive: boolean;
};

function emptyDraft(): Draft {
  return { name: "", code: "classic", initialPoints: "", timePerQuestion: "", isActive: true };
}

function fromMode(mode: GameModeOption): Draft {
  return {
    name: mode.name,
    code: mode.code,
    initialPoints: mode.defaultInitialPoints?.toString() ?? "",
    timePerQuestion: mode.defaultTimePerQuestionSeconds?.toString() ?? "",
    isActive: mode.isActive,
  };
}

export function GameModesDialog({ game, open, onOpenChange }: Props) {
  const createMode = useCreateGameMode();
  const updateMode = useUpdateGameMode();
  const archiveMode = useArchiveGameMode();

  // `null` = the "add new" form, otherwise the id of the mode being edited.
  const [editing, setEditing] = useState<string | null | "none">("none");
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  const submitting = createMode.isPending || updateMode.isPending;

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft());
  }

  function startEdit(mode: GameModeOption) {
    setEditing(mode.id);
    setDraft(fromMode(mode));
  }

  function cancel() {
    setEditing("none");
    setDraft(emptyDraft());
  }

  const numericOrNull = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  async function save() {
    if (draft.name.trim().length < 2) {
      toast.error("Informe o nome do modo.");
      return;
    }
    const payload = {
      name: draft.name.trim(),
      description: null,
      defaultInitialPoints: numericOrNull(draft.initialPoints),
      defaultTimePerQuestionSeconds: numericOrNull(draft.timePerQuestion),
      isActive: draft.isActive,
    };
    try {
      if (editing === null) {
        await createMode.mutateAsync({ gameId: game.id, code: draft.code, ...payload });
        toast.success("Modo criado!");
      } else if (editing !== "none") {
        await updateMode.mutateAsync({
          gameId: game.id,
          modeId: editing,
          code: draft.code,
          ...payload,
        });
        toast.success("Modo atualizado!");
      }
      cancel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o modo.");
    }
  }

  async function archive(mode: GameModeOption) {
    try {
      await archiveMode.mutateAsync({ gameId: game.id, modeId: mode.id });
      toast.success("Modo desativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível desativar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modos de {game.name}</DialogTitle>
          <DialogDescription>Gerencie os modos disponíveis para este jogo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {game.modes.length === 0 && (
            <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
              Nenhum modo cadastrado ainda.
            </p>
          )}
          {game.modes.map((mode) => (
            <div
              key={mode.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{mode.name}</span>
                <Badge variant="outline">{CODE_LABELS[mode.code] ?? mode.code}</Badge>
                {!mode.isActive && <Badge variant="secondary">Inativo</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => startEdit(mode)}>
                  <Pencil className="size-4" />
                </Button>
                {mode.isActive && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={archiveMode.isPending}
                    onClick={() => archive(mode)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {editing === "none" ? (
          <Button variant="outline" className="w-full" onClick={startCreate}>
            <Plus className="mr-1 size-4" /> Adicionar modo
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {editing === null ? "Novo modo" : "Editar modo"}
              </p>
              <Button size="icon" variant="ghost" onClick={cancel}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mode-name">Nome</Label>
                <Input
                  id="mode-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mode-code">Tipo</Label>
                <Select
                  value={draft.code}
                  onValueChange={(value) => setDraft({ ...draft, code: value })}
                  disabled={editing !== null}
                >
                  <SelectTrigger id="mode-code">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mode-points">Pontos/vidas padrão</Label>
                <Input
                  id="mode-points"
                  type="number"
                  value={draft.initialPoints}
                  onChange={(event) => setDraft({ ...draft, initialPoints: event.target.value })}
                  placeholder="—"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mode-time">Tempo/pergunta (s)</Label>
                <Input
                  id="mode-time"
                  type="number"
                  value={draft.timePerQuestion}
                  onChange={(event) => setDraft({ ...draft, timePerQuestion: event.target.value })}
                  placeholder="—"
                />
              </div>
            </div>
            {editing !== null && (
              <div className="flex items-center justify-between">
                <Label htmlFor="mode-active">Ativo</Label>
                <Switch
                  id="mode-active"
                  checked={draft.isActive}
                  onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={submitting}>
                {submitting && <Loader2 className="mr-1 size-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
