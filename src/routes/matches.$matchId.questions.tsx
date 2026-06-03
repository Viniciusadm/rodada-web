import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import {
  addMatchQuestion,
  deleteMatchQuestion,
  getMatchState,
  importMatchQuestions,
  updateMatchQuestion,
  type MatchMode,
  type MatchQuestion,
} from "@/lib/api-client";
import type { DraftOption, DraftQuestionType } from "@/lib/match-types";

export const Route = createFileRoute("/matches/$matchId/questions")({
  head: () => ({
    meta: [{ title: "Perguntas — Games Hub" }],
  }),
  component: QuestionsPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

type Draft = {
  type: DraftQuestionType;
  prompt: string;
  expectedAnswer: string;
  options: DraftOption[];
  points: number;
};

function emptyDraft(): Draft {
  return { type: "free_text", prompt: "", expectedAnswer: "", options: [], points: 100 };
}

function fromQuestion(question: MatchQuestion): Draft {
  const type: DraftQuestionType =
    question.type === "true_false" || question.type === "multiple_choice"
      ? question.type
      : "free_text";
  return {
    type,
    prompt: question.prompt,
    expectedAnswer: question.expectedAnswer,
    options:
      question.options.length > 0
        ? question.options.map((option) => ({ ...option }))
        : [
            { text: "", correct: true },
            { text: "", correct: false },
          ],
    points: question.points,
  };
}

function draftValid(draft: Draft, mode: MatchMode): boolean {
  if (!draft.prompt.trim()) return false;
  if (mode === "buzzer") return draft.expectedAnswer.trim().length > 0;
  if (draft.type === "true_false")
    return draft.expectedAnswer === "true" || draft.expectedAnswer === "false";
  if (draft.type === "multiple_choice") {
    return (
      draft.options.length >= 2 &&
      draft.options.length <= 4 &&
      draft.options.every((option) => option.text.trim().length > 0) &&
      draft.options.filter((option) => option.correct).length === 1
    );
  }
  return draft.expectedAnswer.trim().length > 0;
}

function toPayload(draft: Draft, mode: MatchMode) {
  if (mode === "buzzer") {
    return {
      prompt: draft.prompt,
      expectedAnswer: draft.expectedAnswer,
      points: draft.points,
    };
  }
  if (draft.type === "multiple_choice") {
    const correct = draft.options.find((option) => option.correct);
    return {
      questionType: "multiple_choice" as const,
      prompt: draft.prompt,
      expectedAnswer: correct?.text ?? "",
      options: draft.options,
      points: draft.points,
    };
  }
  return {
    questionType: draft.type,
    prompt: draft.prompt,
    expectedAnswer: draft.expectedAnswer,
    points: draft.points,
  };
}

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

      <PageHeader title="Perguntas da partida" description={query.data.match.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Nova pergunta</p>
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

function QuestionFields({
  mode,
  draft,
  onChange,
  disabled,
}: {
  mode: MatchMode;
  draft: Draft;
  onChange: (draft: Draft) => void;
  disabled?: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  return (
    <div className="space-y-2">
      {mode === "quiz" && (
        <Select
          value={draft.type}
          onValueChange={(v) => {
            const type = v as DraftQuestionType;
            onChange({
              type,
              prompt: draft.prompt,
              points: draft.points,
              expectedAnswer: type === "true_false" ? "true" : "",
              options:
                type === "multiple_choice"
                  ? [
                      { text: "", correct: true },
                      { text: "", correct: false },
                    ]
                  : [],
            });
          }}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
            <SelectItem value="true_false">Verdadeiro ou Falso</SelectItem>
            <SelectItem value="free_text">Texto</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Input
        value={draft.prompt}
        disabled={disabled}
        onChange={(event) => set({ prompt: event.target.value })}
        placeholder={mode === "quiz" && draft.type === "true_false" ? "Afirmação" : "Pergunta"}
      />
      {mode === "buzzer" ? (
        <Input
          value={draft.expectedAnswer}
          disabled={disabled}
          onChange={(event) => set({ expectedAnswer: event.target.value })}
          placeholder="Resposta de referência"
        />
      ) : draft.type === "true_false" ? (
        <Select
          value={draft.expectedAnswer === "true" ? "true" : "false"}
          onValueChange={(v) => set({ expectedAnswer: v })}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verdadeiro</SelectItem>
            <SelectItem value="false">Falso</SelectItem>
          </SelectContent>
        </Select>
      ) : draft.type === "multiple_choice" ? (
        <div className="space-y-2">
          {draft.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={option.correct ? "default" : "outline"}
                className="w-24 shrink-0 justify-center rounded-lg"
                disabled={disabled}
                onClick={() =>
                  set({
                    options: draft.options.map((opt, idx) => ({
                      ...opt,
                      correct: idx === index,
                    })),
                  })
                }
              >
                {option.correct ? (
                  <>
                    <Check className="mr-1 size-4" /> Correta
                  </>
                ) : (
                  "Correta?"
                )}
              </Button>
              <Input
                value={option.text}
                disabled={disabled}
                placeholder={`Opção ${index + 1}`}
                onChange={(event) =>
                  set({
                    options: draft.options.map((opt, idx) =>
                      idx === index ? { ...opt, text: event.target.value } : opt,
                    ),
                  })
                }
              />
              {draft.options.length > 2 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                  onClick={() => set({ options: draft.options.filter((_, idx) => idx !== index) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
          {draft.options.length < 4 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={disabled}
              onClick={() => set({ options: [...draft.options, { text: "", correct: false }] })}
            >
              <Plus className="mr-1 size-4" /> Opção
            </Button>
          )}
        </div>
      ) : (
        <Input
          value={draft.expectedAnswer}
          disabled={disabled}
          onChange={(event) => set({ expectedAnswer: event.target.value })}
          placeholder="Resposta(s) aceitas — separe variações com |"
        />
      )}
      <Input
        type="number"
        min={0}
        value={draft.points}
        disabled={disabled}
        onChange={(event) => set({ points: Number(event.target.value) || 0 })}
        placeholder="Pontos"
      />
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
        {question.used && <span className="text-xs text-muted-foreground">Já usada</span>}
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
