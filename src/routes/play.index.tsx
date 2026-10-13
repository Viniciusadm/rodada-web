import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hand, ListChecks, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [{ title: "Painel — Rodada" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10">
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Bem-vindo de volta
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Pronto para começar uma partida?
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Crie uma partida, compartilhe o link único e reúna os participantes em segundos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/matches/new">
                <PlusCircle className="mr-2 size-4" /> Nova partida
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/matches">Ver partidas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">Modos de jogo</h2>
          <p className="text-sm text-muted-foreground">Escolha um modo para criar sua partida.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              icon: Hand,
              title: "Buzzer",
              description:
                "Mostre a pergunta, os jogadores apertam para responder e você decide quem acertou.",
              color: "text-amber-400 bg-amber-500/15",
            },
            {
              icon: ListChecks,
              title: "Quiz",
              description:
                "Monte perguntas de verdadeiro/falso, texto ou múltipla escolha e correção automática.",
              color: "text-indigo-400 bg-indigo-500/15",
            },
          ].map((mode) => (
            <div
              key={mode.title}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${mode.color}`}>
                <mode.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{mode.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{mode.description}</p>
              <div className="mt-5 flex items-center justify-end border-t border-border/60 pt-4">
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/matches/new">
                    Criar partida
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
