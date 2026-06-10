import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { MatchTemplateWizard } from "@/components/match-template/MatchTemplateWizard";
import {
  errorToMessage,
  getMatchTemplate,
  updateMatchTemplate,
  type MatchTemplateInput,
} from "@/lib/api-client";

export const Route = createFileRoute("/match-templates/$id")({
  head: () => ({
    meta: [{ title: "Editar modelo — Games Hub" }],
  }),
  component: EditMatchTemplatePage,
});

function EditMatchTemplatePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["match-template", id],
    queryFn: () => getMatchTemplate(id),
  });

  const mutation = useMutation({
    mutationFn: (input: MatchTemplateInput) => updateMatchTemplate(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["match-templates"] });
      await queryClient.invalidateQueries({ queryKey: ["match-template", id] });
      toast.success("Modelo atualizado!");
      navigate({ to: "/match-templates" });
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Não foi possível carregar o modelo.
      </div>
    );
  }

  return (
    <MatchTemplateWizard
      key={query.data.id}
      title="Editar modelo"
      description="Atualize as regras e perguntas. Partidas já criadas não são afetadas."
      submitLabel="Salvar alterações"
      submitting={mutation.isPending}
      initial={query.data}
      onSubmit={(input) => mutation.mutate(input)}
    />
  );
}
