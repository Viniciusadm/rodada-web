import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gamepad2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { GAMES_CATALOG } from "@/lib/api-client";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Jogos — Games Hub" },
      { name: "description", content: "Conheça as mecânicas disponíveis e crie um modelo." },
    ],
  }),
  component: GamesPage,
});

const ICONS = {
  buzzer: Zap,
  quiz: Gamepad2,
} as const;

function GamesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Jogos"
        description="Os jogos definem a mecânica. Escolha um para criar um modelo de partida."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES_CATALOG.map((game) => {
          const Icon = ICONS[game.mode];
          return (
            <div
              key={game.mode}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{game.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{game.description}</p>
              <Button asChild className="mt-5 rounded-lg">
                <Link to="/match-templates/new" search={{ mode: game.mode }}>
                  Criar modelo <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
