import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import { useMatchStore } from "@/lib/match-store";

export const Route = createFileRoute("/matches/$matchId/questions")({
  head: () => ({
    meta: [{ title: "Perguntas — HolyPlay" }],
  }),
  component: QuestionsPage,
  notFoundComponent: () => <div className="p-8 text-center">Partida não encontrada.</div>,
});

function QuestionsPage() {
  const { matchId } = Route.useParams();
  const match = useMatchStore((s) => s.matches[matchId]);
  const addQuestion = useMatchStore((s) => s.addQuestion);
  const updateQuestion = useMatchStore((s) => s.updateQuestion);
  const removeQuestion = useMatchStore((s) => s.removeQuestion);
  const importQuestions = useMatchStore((s) => s.importQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ text: "", answer: "", points: 100 });

  if (!match) throw notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 rounded-lg">
        <Link to="/matches/$matchId/host" params={{ matchId }}>
          <ArrowLeft className="mr-1 size-4" /> Voltar para o painel
        </Link>
      </Button>

      <PageHeader
        title="Perguntas da partida"
        description={match.name}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {match.questions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              Nenhuma pergunta cadastrada. Adicione manualmente ou importe via CSV.
            </div>
          )}
          {match.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4">
              {editingId === q.id ? (
                <div className="space-y-2">
                  <Input
                    defaultValue={q.text}
                    onChange={(e) => (q.text = e.target.value)}
                    id={`t-${q.id}`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      defaultValue={q.answer}
                      onChange={(e) => (q.answer = e.target.value)}
                      className="col-span-2"
                      id={`a-${q.id}`}
                    />
                    <Input
                      type="number"
                      defaultValue={q.points}
                      onChange={(e) => (q.points = Number(e.target.value) || 0)}
                      id={`p-${q.id}`}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        const text = (document.getElementById(`t-${q.id}`) as HTMLInputElement).value;
                        const answer = (document.getElementById(`a-${q.id}`) as HTMLInputElement).value;
                        const points = Number(
                          (document.getElementById(`p-${q.id}`) as HTMLInputElement).value,
                        );
                        updateQuestion(matchId, q.id, { text, answer, points });
                        setEditingId(null);
                        toast.success("Pergunta atualizada.");
                      }}
                    >
                      <Check className="mr-1 size-3.5" /> Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Resposta: <span className="text-foreground">{q.answer}</span>
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
                    {q.points} pts
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={() => setEditingId(q.id)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeQuestion(matchId, q.id);
                      toast.success("Pergunta removida.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Adicionar pergunta</p>
            <div className="space-y-2">
              <Input
                placeholder="Pergunta"
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              />
              <Input
                placeholder="Resposta"
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Pontos"
                value={draft.points}
                onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) || 0 })}
              />
              <Button
                className="w-full rounded-lg"
                disabled={!draft.text || !draft.answer}
                onClick={() => {
                  addQuestion(matchId, draft);
                  setDraft({ text: "", answer: "", points: 100 });
                  toast.success("Pergunta adicionada.");
                }}
              >
                <Plus className="mr-1 size-4" /> Adicionar
              </Button>
            </div>
          </div>

          <CsvImport
            onImport={(rows) => {
              const n = importQuestions(matchId, rows);
              toast.success(`${n} perguntas importadas.`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
