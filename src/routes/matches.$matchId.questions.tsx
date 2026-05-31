import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import {
  addMatchQuestion,
  deleteMatchQuestion,
  getMatchState,
  importMatchQuestions,
  updateMatchQuestion,
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
  const [draft, setDraft] = useState({ prompt: "", expectedAnswer: "", points: 100 });
  const query = useQuery({
    queryKey: ["match-state", matchId],
    queryFn: () => getMatchState(matchId),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["match-state", matchId] });
  const createMutation = useMutation({
    mutationFn: () => addMatchQuestion(matchId, draft),
    onSuccess: async () => {
      setDraft({ prompt: "", expectedAnswer: "", points: 100 });
      await refresh();
      toast.success("Pergunta criada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: (question: MatchQuestion) => updateMatchQuestion(matchId, question.id, question),
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

      <PageHeader title="Perguntas da partida" description={query.data.match.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Nova pergunta</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_90px_auto]">
              <Input
                value={draft.prompt}
                onChange={(event) => setDraft({ ...draft, prompt: event.target.value })}
                placeholder="Pergunta"
              />
              <Input
                value={draft.expectedAnswer}
                onChange={(event) => setDraft({ ...draft, expectedAnswer: event.target.value })}
                placeholder="Resposta correta"
              />
              <Input
                type="number"
                min={0}
                value={draft.points}
                onChange={(event) =>
                  setDraft({ ...draft, points: Number(event.target.value) || 0 })
                }
                placeholder="Pontos"
              />
              <Button
                className="rounded-lg"
                disabled={
                  !draft.prompt.trim() || !draft.expectedAnswer.trim() || createMutation.isPending
                }
                onClick={() => createMutation.mutate()}
              >
                <Plus className="mr-1 size-4" /> Criar
              </Button>
            </div>
          </div>

          {query.data.questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              disabled={updateMutation.isPending || deleteMutation.isPending}
              onSave={(next) => updateMutation.mutate(next)}
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
  disabled,
  onSave,
  onDelete,
}: {
  question: MatchQuestion;
  disabled: boolean;
  onSave: (question: MatchQuestion) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(question);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pergunta {question.position}
        </span>
        {question.used && <span className="text-xs text-muted-foreground">Já usada</span>}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_90px_auto_auto]">
        <Input
          value={draft.prompt}
          disabled={question.used}
          onChange={(event) => setDraft({ ...draft, prompt: event.target.value })}
        />
        <Input
          value={draft.expectedAnswer}
          disabled={question.used}
          onChange={(event) => setDraft({ ...draft, expectedAnswer: event.target.value })}
        />
        <Input
          type="number"
          min={0}
          value={draft.points}
          disabled={question.used}
          onChange={(event) => setDraft({ ...draft, points: Number(event.target.value) || 0 })}
        />
        <Button
          size="icon"
          variant="outline"
          disabled={disabled || question.used}
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
