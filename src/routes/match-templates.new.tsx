import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MatchTemplateWizard } from "@/components/match-template/MatchTemplateWizard";
import { createMatchTemplate, errorToMessage, type MatchMode } from "@/lib/api-client";

export const Route = createFileRoute("/match-templates/new")({
  validateSearch: (search: Record<string, unknown>): { mode?: MatchMode } => {
    const mode = search.mode;
    return { mode: mode === "buzzer" || mode === "quiz" ? mode : undefined };
  },
  head: () => ({
    meta: [
      { title: "Novo modelo — Games Hub" },
      { name: "description", content: "Crie um modelo de partida reutilizável." },
    ],
  }),
  component: NewMatchTemplatePage,
});

function NewMatchTemplatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mode } = Route.useSearch();

  const mutation = useMutation({
    mutationFn: createMatchTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["match-templates"] });
      toast.success("Modelo criado!");
      navigate({ to: "/match-templates" });
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });

  return (
    <MatchTemplateWizard
      title="Novo modelo"
      description="Configure as regras e monte as perguntas deste modelo."
      submitLabel="Criar modelo"
      submitting={mutation.isPending}
      initialMode={mode}
      onSubmit={(input) => mutation.mutate(input)}
    />
  );
}
