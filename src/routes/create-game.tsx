import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create-game")({
  head: () => ({
    meta: [
      { title: "Criar jogo — HolyPlay" },
      { name: "description", content: "Crie um novo jogo bíblico interativo para sua igreja." },
    ],
  }),
  component: CreateGamePage,
});

const steps = ["Informações", "Perguntas", "Revisão"];

function CreateGamePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([
    { q: "Quem construiu a arca?", a: "Noé" },
    { q: "Em quantos dias Deus criou o mundo?", a: "6" },
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Criar novo jogo" description="Monte um jogo bíblico personalizado em poucos passos." />

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-3">
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
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do jogo</Label>
              <Input id="name" placeholder="Ex.: Quiz dos Profetas" defaultValue="Quiz dos Profetas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição curta</Label>
              <Textarea id="desc" rows={3} placeholder="Conte do que se trata o jogo" defaultValue="Um quiz desafiador sobre os profetas do Antigo Testamento." />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select defaultValue="quiz">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz Bíblico</SelectItem>
                    <SelectItem value="memoria">Memorização</SelectItem>
                    <SelectItem value="adivinhacao">Adivinhação</SelectItem>
                    <SelectItem value="velocidade">Velocidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faixa etária</Label>
                <Select defaultValue="todos">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kids">Kids (até 11)</SelectItem>
                    <SelectItem value="adolescentes">Adolescentes</SelectItem>
                    <SelectItem value="jovens">Jovens</SelectItem>
                    <SelectItem value="adultos">Adultos</SelectItem>
                    <SelectItem value="todos">Todas idades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Perguntas</h3>
                <p className="text-sm text-muted-foreground">Adicione as perguntas e respostas do jogo.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuestions([...questions, { q: "", a: "" }])}
                className="rounded-lg"
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
                  <Input placeholder="Pergunta" defaultValue={q.q} className="mb-2" />
                  <Input placeholder="Resposta correta" defaultValue={q.a} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumo</p>
              <h3 className="mt-2 text-xl font-semibold">Quiz dos Profetas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Um quiz desafiador sobre os profetas do Antigo Testamento.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-2xl font-semibold">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Perguntas</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-2xl font-semibold">Quiz</p>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-2xl font-semibold">Todos</p>
                  <p className="text-xs text-muted-foreground">Idades</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao publicar, o jogo ficará disponível na biblioteca para todos os líderes da sua igreja.
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
            <Button onClick={() => setStep(step + 1)} className="rounded-lg">
              Próximo <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => { toast.success("Jogo criado com sucesso!"); navigate({ to: "/games" }); }}
              className="rounded-lg"
            >
              <Check className="mr-1 size-4" /> Publicar jogo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
