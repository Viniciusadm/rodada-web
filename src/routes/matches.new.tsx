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
import { createMatch } from "@/lib/api-client";
import { useGamesQuery } from "@/features/games-hub-data";
import type { GameMode } from "@/lib/match-types";
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

type DraftQ = { text: string; answer: string; points: number };

function NewMatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: games = [] } = useGamesQuery();
  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: async (match) => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partida criada!");
      navigate({ to: "/matches/$matchId/host", params: { matchId: match.id } });
    },
    onError: (error) => toast.error(error.message),
  });
  const [step, setStep] = useState(0);

  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("Quiz dos Profetas");
  const [mode, setMode] = useState<GameMode>("classico");
  const [maxQuestions, setMaxQuestions] = useState<string>("10");
  const [timePerQuestion, setTimePerQuestion] = useState<string>("20");
  const [initialPoints, setInitialPoints] = useState<string>("500");
  const [remoteEnabled, setRemoteEnabled] = useState(true);

  const [questions, setQuestions] = useState<DraftQ[]>([
    { text: "Quem foi o profeta levado ao céu em um carro de fogo?", answer: "Elias", points: 100 },
    { text: "Qual profeta foi engolido por um grande peixe?", answer: "Jonas", points: 100 },
  ]);

  function canAdvance() {
    if (step === 0) return name.trim().length > 0 && (gameId || games[0]?.id);
    if (step === 1) return questions.length > 0 && questions.every((q) => q.text && q.answer);
    return true;
  }

  function submit() {
    createMatchMutation.mutate({
      name: name.trim(),
      mode,
      maxQuestions: maxQuestions ? Number(maxQuestions) : undefined,
      timePerQuestion: timePerQuestion ? Number(timePerQuestion) : undefined,
      initialPoints: mode === "pontos-iniciais" ? Number(initialPoints) : undefined,
      remoteEnabled,
      questions,
      gameId: gameId || games[0]?.id,
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Jogo</Label>
                <Select value={gameId || games[0]?.id || ""} onValueChange={setGameId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modo de jogo</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as GameMode)}>
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
              {mode === "pontos-iniciais" && (
                <div className="space-y-2">
                  <Label htmlFor="ip">Pontos iniciais por jogador</Label>
                  <Input
                    id="ip"
                    type="number"
                    min={0}
                    value={initialPoints}
                    onChange={(e) => setInitialPoints(e.target.value)}
                  />
                </div>
              )}
            </div>
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
                setQuestions((qs) => [...qs, ...rows]);
                toast.success(`${rows.length} perguntas importadas.`);
              }}
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Perguntas ({questions.length})</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione manualmente ou importe via CSV.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => setQuestions([...questions, { text: "", answer: "", points: 100 }])}
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
                  <Input
                    placeholder="Pergunta"
                    value={q.text}
                    onChange={(e) =>
                      setQuestions(
                        questions.map((qq, idx) =>
                          idx === i ? { ...qq, text: e.target.value } : qq,
                        ),
                      )
                    }
                    className="mb-2"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Resposta correta"
                      value={q.answer}
                      onChange={(e) =>
                        setQuestions(
                          questions.map((qq, idx) =>
                            idx === i ? { ...qq, answer: e.target.value } : qq,
                          ),
                        )
                      }
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Pontos"
                      value={q.points}
                      onChange={(e) =>
                        setQuestions(
                          questions.map((qq, idx) =>
                            idx === i ? { ...qq, points: Number(e.target.value) || 0 } : qq,
                          ),
                        )
                      }
                    />
                  </div>
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
                  {
                    label: "Modo",
                    value:
                      mode === "classico"
                        ? "Clássico"
                        : mode === "pontos-iniciais"
                          ? "Pts iniciais"
                          : "Eliminação",
                  },
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
