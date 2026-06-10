import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Library, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import { QuestionFields } from "@/components/match/QuestionFields";
import {
  draftValid,
  emptyDraft,
  fromQuestion,
  type Draft,
} from "@/components/match/question-draft";
import { useGeneralQuestionsQuery } from "@/features/games-hub-data";
import {
  createGeneralQuestion,
  deleteGeneralQuestion,
  importGeneralQuestions,
  updateGeneralQuestion,
  type GeneralQuestion,
} from "@/lib/api-client";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/general-questions/")({
  head: () => ({
    meta: [{ title: "Perguntas gerais — Games Hub" }],
  }),
  component: GeneralQuestionsPage,
});

function draftToInput(draft: Draft) {
  const correct = draft.options.find((option) => option.correct);
  return {
    questionType: draft.type,
    prompt: draft.prompt.trim(),
    expectedAnswer:
      draft.type === "multiple_choice" ? (correct?.text ?? "") : draft.expectedAnswer.trim(),
    options: draft.type === "multiple_choice" ? draft.options : undefined,
    points: draft.points,
  };
}

function GeneralQuestionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const query = useGeneralQuestionsQuery({ search: debounced, page, pageSize: PAGE_SIZE });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["general-questions"] });

  const createMutation = useMutation({
    mutationFn: () => createGeneralQuestion(draftToInput(draft)),
    onSuccess: async () => {
      setDraft(emptyDraft());
      await refresh();
      toast.success("Pergunta geral criada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { id: string; draft: Draft }) =>
      updateGeneralQuestion(input.id, draftToInput(input.draft)),
    onSuccess: async () => {
      await refresh();
      toast.success("Pergunta geral atualizada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGeneralQuestion(id),
    onSuccess: async () => {
      await refresh();
      toast.success("Pergunta geral removida.");
    },
    onError: (error) => toast.error(error.message),
  });
  const importMutation = useMutation({
    mutationFn: (csv: string) => importGeneralQuestions(csv),
    onSuccess: async (result) => {
      await refresh();
      const invalid = result.invalidRows.length ? ` ${result.invalidRows.length} inválidas.` : "";
      toast.success(`${result.created} perguntas importadas.${invalid}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Perguntas gerais"
        description="Cadastre perguntas reutilizáveis para adicionar rapidamente às suas partidas."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar perguntas..."
              className="pl-9"
            />
          </div>

          {query.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Library}
              title={debounced ? "Nenhuma pergunta encontrada" : "Nenhuma pergunta geral ainda"}
              description={
                debounced
                  ? "Tente outro termo de busca."
                  : "Crie perguntas reutilizáveis para montar partidas mais rápido."
              }
            />
          ) : (
            <>
              {items.map((question) => (
                <GeneralQuestionEditor
                  key={question.id}
                  question={question}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  onSave={(next) => updateMutation.mutate({ id: question.id, draft: next })}
                  onDelete={() => deleteMutation.mutate(question.id)}
                />
              ))}
              <div className="flex items-center justify-between pt-1 text-sm text-muted-foreground">
                <span>{total} pergunta(s)</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span>
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-3 text-sm font-semibold">Nova pergunta geral</p>
          <QuestionFields mode="quiz" draft={draft} onChange={setDraft} />
          <Button
            className="mt-3 w-full rounded-lg"
            disabled={!draftValid(draft, "quiz") || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="mr-1 size-4" /> Criar
          </Button>
          <div className="mt-4">
            <CsvImport onImportCsv={(csv) => importMutation.mutate(csv)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralQuestionEditor({
  question,
  disabled,
  onSave,
  onDelete,
}: {
  question: GeneralQuestion;
  disabled: boolean;
  onSave: (draft: Draft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(fromQuestion(question));
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <QuestionFields mode="quiz" draft={draft} onChange={setDraft} />
      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="icon"
          variant="outline"
          disabled={disabled || !draftValid(draft, "quiz")}
          onClick={() => onSave(draft)}
        >
          <Save className="size-4" />
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={disabled}
            >
              <Trash2 className="size-4" />
            </Button>
          }
          title="Excluir pergunta geral?"
          description="As perguntas já copiadas para partidas não serão afetadas."
          destructive
          confirmLabel="Excluir"
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}
