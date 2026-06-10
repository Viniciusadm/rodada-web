import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, HelpCircle, LayoutTemplate, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useMatchTemplatesQuery } from "@/features/games-hub-data";
import { createMatch, errorToMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches/new")({
  validateSearch: (search: Record<string, unknown>): { template?: string } => ({
    template: typeof search.template === "string" ? search.template : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Criar partida — Games Hub" },
      { name: "description", content: "Crie uma partida a partir de um modelo." },
    ],
  }),
  component: NewMatchPage,
});

function NewMatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { template: presetTemplate } = Route.useSearch();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(presetTemplate ?? null);
  const [name, setName] = useState("");

  const { data: templates = [], isLoading, isError } = useMatchTemplatesQuery(search);

  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: async (match) => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partida criada!");
      navigate({ to: "/matches/$matchId/host", params: { matchId: match.id } });
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });

  function submit() {
    if (!selectedId) return;
    createMatchMutation.mutate({ templateId: selectedId, name: name.trim() || undefined });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Criar partida"
        description="Escolha um modelo de partida e gere uma nova execução."
        actions={
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/match-templates/new">
              <PlusCircle className="mr-1 size-4" /> Novo modelo
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Modelo de partida</Label>
          <Input
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[68px] rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Não foi possível carregar os modelos.
            </div>
          ) : templates.length === 0 ? (
            <EmptyState
              icon={LayoutTemplate}
              title={search ? "Nenhum modelo encontrado" : "Nenhum modelo disponível"}
              description="Crie um modelo de partida antes de gerar uma partida."
              action={
                <Button asChild className="rounded-lg">
                  <Link to="/match-templates/new">Criar modelo</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition",
                    selectedId === template.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{template.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <HelpCircle className="size-3.5" />
                      {template.questionCount} pergunta(s)
                    </p>
                  </div>
                  <Badge variant="secondary">{template.modeLabel}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="match-name">Nome da partida (opcional)</Label>
          <Input
            id="match-name"
            placeholder="Deixe em branco para usar o nome do modelo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button
            onClick={submit}
            className="rounded-lg"
            disabled={!selectedId || createMatchMutation.isPending}
          >
            <Check className="mr-1 size-4" /> Gerar partida
          </Button>
        </div>
      </div>
    </div>
  );
}
