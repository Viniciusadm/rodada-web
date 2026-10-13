import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, HelpCircle, LayoutTemplate, Pencil, PlusCircle, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useMatchTemplatesQuery } from "@/features/games-hub-data";
import { deleteMatchTemplate, duplicateMatchTemplate, errorToMessage } from "@/lib/api-client";

export const Route = createFileRoute("/match-templates/")({
  head: () => ({
    meta: [
      { title: "Modelos de partida — Rodada" },
      { name: "description", content: "Crie e gerencie modelos reutilizáveis de partida." },
    ],
  }),
  component: MatchTemplatesPage,
});

function MatchTemplatesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading, isError } = useMatchTemplatesQuery(search);

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["match-templates"] });
  }

  const duplicateMutation = useMutation({
    mutationFn: duplicateMatchTemplate,
    onSuccess: async () => {
      await invalidate();
      toast.success("Modelo duplicado!");
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMatchTemplate,
    onSuccess: async () => {
      await invalidate();
      toast.success("Modelo excluído.");
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Modelos de partida"
        description="Modelos definem o conteúdo e a configuração. Crie partidas a partir deles."
        actions={
          <Button asChild className="rounded-lg">
            <Link to="/match-templates/new">
              <PlusCircle className="mr-1 size-4" /> Novo modelo
            </Link>
          </Button>
        }
      />

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Buscar modelos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[196px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Não foi possível carregar os modelos.
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={search ? "Nenhum modelo encontrado" : "Nenhum modelo criado ainda"}
          description={
            search
              ? "Tente outro termo de busca."
              : "Crie um modelo para depois gerar partidas a partir dele."
          }
          action={
            <Button asChild className="rounded-lg">
              <Link to="/match-templates/new">Criar primeiro modelo</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold">{template.name}</h3>
                <Badge variant="secondary">{template.modeLabel}</Badge>
              </div>
              {template.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {template.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <HelpCircle className="size-3.5" />
                {template.questionCount} pergunta(s)
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="flex-1 rounded-lg">
                  <Link to="/matches/new" search={{ template: template.id }}>
                    <Swords className="mr-1 size-3.5" /> Criar partida
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link to="/match-templates/$id" params={{ id: template.id }}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  disabled={duplicateMutation.isPending}
                  onClick={() => duplicateMutation.mutate(template.id)}
                >
                  <Copy className="size-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                  title="Excluir modelo"
                  description={`Tem certeza que deseja excluir "${template.name}"? Partidas já criadas não são afetadas.`}
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() => deleteMutation.mutate(template.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
