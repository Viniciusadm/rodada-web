import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Library, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import { QuestionFields } from "@/components/match/QuestionFields";
import {
  draftValid,
  emptyDraft,
  fromQuestion,
  toPayload,
  type Draft,
} from "@/components/match/question-draft";
import { TemplatePickerDialog } from "@/components/match/TemplatePickerDialog";
import {
  addMatchQuestion,
  deleteMatchQuestion,
  getMatchState,
  importMatchQuestions,
  updateMatchQuestion,
  type GeneralQuestion,
  type MatchMode,
  type MatchQuestion,
} from "@/lib/api-client";

export const Route = createFileRoute("/matches/$matchId/questions")({
  head: () => ({
    meta: [{ title: "Perguntas — Games Hub" }],
  }),
  component: QuestionsPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function QuestionsPage() {
  const { matchId } = Route.useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
  const mode: MatchMode = query.data?.settings.mode ?? "buzzer";
  const createMutation = useMutation({
    mutationFn: () => addMatchQuestion(matchId, toPayload(draft, mode)),
    onSuccess: async () => {
      setDraft(emptyDraft());
      await refresh();
      toast.success("Pergunta criada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const addTemplatesMutation = useMutation({
    mutationFn: async (templates: GeneralQuestion[]) => {
      for (const template of templates) {
        await addMatchQuestion(matchId, {
          ...toPayload(fromQuestion(template), mode),
          sourceQuestionId: template.id,
        });
      }
    },
    onSuccess: async (_data, templates) => {
      await refresh();
      toast.success(`${templates.length} pergunta(s) adicionada(s) do banco.`);
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { id: string; draft: Draft }) =>
      updateMatchQuestion(matchId, input.id, toPayload(input.draft, mode)),
    onSuccess: async () => {
      await refresh();
      toast.success("Pergunta atualizada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (questionId: string) => deleteMatchQuestion(matchId, questionId),
    onSuccess: async () => {
      await refresh();
      toast.success("Pergunta removida.");
    },
    onError: (error) => toast.error(error.message),
  });
  const importMutation = useMutation({
    mutationFn: (csv: string) => importMatchQuestions(matchId, csv),
    onSuccess: async (result) => {
      await refresh();
      const invalid = result.invalidRows.length ? ` ${result.invalidRows.length} inválidas.` : "";
      toast.success(`${result.created} perguntas importadas.${invalid}`);
    },
    onError: (error) => toast.error(error.message),
  });

  if (query.isLoading) {
    return <div className="mx-auto max-w-5xl text-sm text-muted-foreground">Carregando...</div>;
  }
  if (query.isError || !query.data) throw notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 rounded-lg">
        <Link to="/matches/$matchId/host" params={{ matchId }}>
          <ArrowLeft className="mr-1 size-4" /> Voltar para o painel
        </Link>
      </Button>

      <PageHeader
        title="Perguntas da partida"
        description={query.data.match.name}
        actions={
          <TemplatePickerDialog onAdd={(templates) => addTemplatesMutation.mutate(templates)} />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Nova pergunta</p>
              <TemplatePickerDialog
                triggerLabel="Do banco"
                onAdd={(templates) => addTemplatesMutation.mutate(templates)}
              />
            </div>
            <QuestionFields mode={mode} draft={draft} onChange={setDraft} />
            <Button
              className="mt-3 rounded-lg"
              disabled={!draftValid(draft, mode) || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              <Plus className="mr-1 size-4" /> Criar
            </Button>
          </div>

          {query.data.questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              mode={mode}
              disabled={updateMutation.isPending || deleteMutation.isPending}
              onSave={(next) => updateMutation.mutate({ id: question.id, draft: next })}
              onDelete={() => deleteMutation.mutate(question.id)}
            />
          ))}
          {query.data.questions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              Nenhuma pergunta cadastrada.
            </div>
          )}
        </div>
        <CsvImport onImportCsv={(csv) => importMutation.mutate(csv)} />
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  mode,
  disabled,
  onSave,
  onDelete,
}: {
  question: MatchQuestion;
  mode: MatchMode;
  disabled: boolean;
  onSave: (draft: Draft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(fromQuestion(question));
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pergunta {question.position}
        </span>
        <div className="flex items-center gap-2">
          {question.sourceQuestionId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Library className="size-3" /> Do banco
            </span>
          )}
          {question.used && <span className="text-xs text-muted-foreground">Já usada</span>}
        </div>
      </div>
      <QuestionFields mode={mode} draft={draft} onChange={setDraft} disabled={question.used} />
      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="icon"
          variant="outline"
          disabled={disabled || question.used || !draftValid(draft, mode)}
          onClick={() => onSave(draft)}
        >
          <Save className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={disabled || question.used}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
