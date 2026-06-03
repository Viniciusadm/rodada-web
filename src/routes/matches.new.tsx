import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/common/PageHeader";
import { CsvImport } from "@/components/match/CsvImport";
import { createMatch, errorToMessage, type MatchMode } from "@/lib/api-client";
import type { DraftOption, DraftQuestionType, GameMode } from "@/lib/match-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches/new")({
  head: () => ({
    meta: [
      { title: "Nova partida — Games Hub" },
      { name: "description", content: "Crie uma nova partida e configure suas regras." },
    ],
  }),
  component: NewMatchPage,
});

const steps = ["Regras", "Perguntas", "Revisão"];

type DraftQ = {
  type: DraftQuestionType;
  text: string;
  answer: string;
  options: DraftOption[];
  points: number;
};

function emptyQuestion(type: DraftQuestionType): DraftQ {
  if (type === "multiple_choice") {
    return {
      type,
      text: "",
      answer: "",
      options: [
        { text: "", correct: true },
        { text: "", correct: false },
      ],
      points: 100,
    };
  }
  return {
    type,
    text: "",
    answer: type === "true_false" ? "true" : "",
    options: [],
    points: 100,
  };
}

function questionValid(q: DraftQ, mode: MatchMode): boolean {
  if (!q.text.trim()) return false;
  if (mode === "buzzer") return q.answer.trim().length > 0;
  if (q.type === "true_false") return q.answer === "true" || q.answer === "false";
  if (q.type === "multiple_choice") {
    return (
      q.options.length >= 2 &&
      q.options.length <= 4 &&
      q.options.every((option) => option.text.trim().length > 0) &&
      q.options.filter((option) => option.correct).length === 1
    );
  }
  return q.answer.trim().length > 0;
}

function NewMatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: async (match) => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partida criada!");
      navigate({ to: "/matches/$matchId/host", params: { matchId: match.id } });
    },
    onError: (error) => toast.error(errorToMessage(error)),
  });
  const [step, setStep] = useState(0);

  const [mode, setMode] = useState<MatchMode>("quiz");
  const [name, setName] = useState("");
  const [scoringMode, setScoringMode] = useState<GameMode>("classico");
  const [maxQuestions, setMaxQuestions] = useState<string>("10");
  const [timePerQuestion, setTimePerQuestion] = useState<string>("20");
  const [initialPoints, setInitialPoints] = useState<string>("500");
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const [buzzerArmDelay, setBuzzerArmDelay] = useState<string>("0");
  const [rankingDisplay, setRankingDisplay] = useState<
    "always" | "between_questions" | "end_only"
  >("always");

  const [questions, setQuestions] = useState<DraftQ[]>([]);

  function updateQuestion(index: number, patch: Partial<DraftQ>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function canAdvance() {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return questions.length > 0 && questions.every((q) => questionValid(q, mode));
    return true;
  }

  function submit() {
    createMatchMutation.mutate({
      name: name.trim(),
      mode,
      scoringMode: mode === "buzzer" ? scoringMode : undefined,
      maxQuestions: maxQuestions ? Number(maxQuestions) : undefined,
      timePerQuestion: timePerQuestion ? Number(timePerQuestion) : undefined,
      initialPoints:
        mode === "buzzer" && (scoringMode === "pontos-iniciais" || scoringMode === "eliminacao")
          ? Number(initialPoints)
          : undefined,
      remoteEnabled,
      buzzerArmDelaySeconds:
        mode === "buzzer" ? Math.min(5, Math.max(0, Number(buzzerArmDelay) || 0)) : undefined,
      rankingDisplay: mode === "quiz" ? rankingDisplay : undefined,
      questions: questions.map((q) => ({
        type: q.type,
        text: q.text,
        answer: q.answer,
        options: q.type === "multiple_choice" ? q.options : undefined,
        points: q.points,
      })),
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Nova partida"
        description="Configure as regras, monte as perguntas e inicie sua partida."
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-border",
                i < step && "bg-success text-success-foreground ring-success",
                i === step && "bg-primary text-primary-foreground ring-primary",
                i > step && "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da partida</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Modo</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "buzzer" as MatchMode,
                    title: "Buzzer",
                    description: "Jogadores apertam para responder; você decide quem acertou.",
                  },
                  {
                    value: "quiz" as MatchMode,
                    title: "Quiz",
                    description: "Perguntas com correção automática.",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      mode === option.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {mode === "buzzer" && (
                <div className="space-y-2">
                  <Label>Modo de pontuação</Label>
                  <Select
                    value={scoringMode}
                    onValueChange={(v) => {
                      const next = v as GameMode;
                      setScoringMode(next);
                      if (next === "eliminacao") setInitialPoints("3");
                      else if (next === "pontos-iniciais") setInitialPoints("500");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classico">Clássico — acúmulo de pontos</SelectItem>
                      <SelectItem value="pontos-iniciais">Pontos iniciais</SelectItem>
                      <SelectItem value="eliminacao">Eliminação por erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {mode === "quiz" && (
                <div className="space-y-2">
                  <Label>Exibição do ranking</Label>
                  <Select
                    value={rankingDisplay}
                    onValueChange={(v) =>
                      setRankingDisplay(v as "always" | "between_questions" | "end_only")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Sempre mostrar ranking</SelectItem>
                      <SelectItem value="between_questions">
                        Mostrar somente entre perguntas
                      </SelectItem>
                      <SelectItem value="end_only">Mostrar só no final</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controla quando o placar aparece na tela de apresentação.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="max">Máximo de perguntas (opcional)</Label>
                <Input
                  id="max"
                  type="number"
                  min={1}
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Tempo por pergunta (segundos)</Label>
                <Input
                  id="time"
                  type="number"
                  min={5}
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(e.target.value)}
                />
              </div>
              {mode === "buzzer" &&
                (scoringMode === "pontos-iniciais" || scoringMode === "eliminacao") && (
                  <div className="space-y-2">
                    <Label htmlFor="ip">
                      {scoringMode === "eliminacao"
                        ? "Vidas por jogador"
                        : "Pontos iniciais por jogador"}
                    </Label>
                    <Input
                      id="ip"
                      type="number"
                      min={scoringMode === "eliminacao" ? 1 : 0}
                      value={initialPoints}
                      onChange={(e) => setInitialPoints(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {scoringMode === "eliminacao"
                        ? "Cada erro tira uma vida. Ao zerar, o jogador é eliminado; o último de pé vence."
                        : "Todos começam o placar com essa pontuação."}
                    </p>
                  </div>
                )}
            </div>
            {mode === "buzzer" && (
              <div className="space-y-2">
                <Label htmlFor="arm-delay">Tempo de espera do buzzer (segundos)</Label>
                <Input
                  id="arm-delay"
                  type="number"
                  min={0}
                  max={5}
                  value={buzzerArmDelay}
                  onChange={(e) => setBuzzerArmDelay(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ao abrir a pergunta, o botão "Eu sei" fica bloqueado por esse tempo (0 a 5s). Quem
                  clicar antes é eliminado da rodada. Use 0 para desativar.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Participação remota</p>
                <p className="text-xs text-muted-foreground">
                  Jogadores entram pelo celular usando o link da partida.
                </p>
              </div>
              <Switch checked={remoteEnabled} onCheckedChange={setRemoteEnabled} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <CsvImport
              onImport={(rows) => {
                setQuestions((qs) => [
                  ...qs,
                  ...rows.map((row) => ({
                    type: row.type,
                    text: row.text,
                    answer: row.answer,
                    options: row.options ?? [],
                    points: row.points,
                  })),
                ]);
                toast.success(`${rows.length} perguntas importadas.`);
              }}
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Perguntas ({questions.length})</h3>
                <p className="text-sm text-muted-foreground">
                  {mode === "buzzer"
                    ? "Enunciado e resposta de referência para você julgar."
                    : "Escolha o tipo de cada pergunta."}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => setQuestions([...questions, emptyQuestion("free_text")])}
              >
                <Plus className="mr-1 size-4" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pergunta {i + 1}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {mode === "quiz" && (
                    <div className="mb-2">
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          setQuestions(
                            questions.map((qq, idx) =>
                              idx === i
                                ? { ...emptyQuestion(v as DraftQuestionType), text: qq.text }
                                : qq,
                            ),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                          <SelectItem value="true_false">Verdadeiro ou Falso</SelectItem>
                          <SelectItem value="free_text">Texto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Input
                    placeholder={
                      mode === "quiz" && q.type === "true_false" ? "Afirmação" : "Pergunta"
                    }
                    value={q.text}
                    onChange={(e) => updateQuestion(i, { text: e.target.value })}
                    className="mb-2"
                  />

                  {mode === "buzzer" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Resposta de referência"
                        value={q.answer}
                        onChange={(e) => updateQuestion(i, { answer: e.target.value })}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Pontos"
                        value={q.points}
                        onChange={(e) => updateQuestion(i, { points: Number(e.target.value) || 0 })}
                      />
                    </div>
                  ) : q.type === "true_false" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={q.answer === "true" ? "true" : "false"}
                        onValueChange={(v) => updateQuestion(i, { answer: v })}
                      >
                        <SelectTrigger className="col-span-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Verdadeiro</SelectItem>
                          <SelectItem value="false">Falso</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Pontos"
                        value={q.points}
                        onChange={(e) => updateQuestion(i, { points: Number(e.target.value) || 0 })}
                      />
                    </div>
                  ) : q.type === "multiple_choice" ? (
                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={option.correct ? "default" : "outline"}
                            className="w-24 shrink-0 justify-center rounded-lg"
                            onClick={() =>
                              updateQuestion(i, {
                                options: q.options.map((opt, idx) => ({
                                  ...opt,
                                  correct: idx === optionIndex,
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
                            placeholder={`Opção ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(e) =>
                              updateQuestion(i, {
                                options: q.options.map((opt, idx) =>
                                  idx === optionIndex ? { ...opt, text: e.target.value } : opt,
                                ),
                              })
                            }
                          />
                          {q.options.length > 2 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                updateQuestion(i, {
                                  options: q.options.filter((_, idx) => idx !== optionIndex),
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        {q.options.length < 4 ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() =>
                              updateQuestion(i, {
                                options: [...q.options, { text: "", correct: false }],
                              })
                            }
                          >
                            <Plus className="mr-1 size-4" /> Opção
                          </Button>
                        ) : (
                          <span />
                        )}
                        <Input
                          type="number"
                          placeholder="Pontos"
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(i, { points: Number(e.target.value) || 0 })
                          }
                          className="w-28"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Resposta(s) aceitas — separe variações com |"
                        value={q.answer}
                        onChange={(e) => updateQuestion(i, { answer: e.target.value })}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Pontos"
                        value={q.points}
                        onChange={(e) => updateQuestion(i, { points: Number(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resumo
              </p>
              <h3 className="mt-2 text-xl font-semibold">{name}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Perguntas", value: questions.length },
                  { label: "Modo", value: mode === "buzzer" ? "Buzzer" : "Quiz" },
                  { label: "Tempo/pergunta", value: timePerQuestion ? `${timePerQuestion}s` : "—" },
                  { label: "Remoto", value: remoteEnabled ? "Sim" : "Não" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-background/60 p-3 text-center">
                    <p className="text-lg font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao criar, você será direcionado ao painel para adicionar jogadores e iniciar a
              partida.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="rounded-lg"
          >
            <ArrowLeft className="mr-1 size-4" /> Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="rounded-lg"
            >
              Próximo <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              className="rounded-lg"
              disabled={createMatchMutation.isPending}
            >
              <Check className="mr-1 size-4" /> Criar partida
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
