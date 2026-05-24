import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { GameCard } from "@/components/games/GameCard";
import { ComingSoonCard } from "@/components/games/ComingSoonCard";
import { games } from "@/lib/mock-data";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Jogos — HolyPlay" },
      { name: "description", content: "Biblioteca completa de jogos bíblicos disponíveis na HolyPlay." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Biblioteca de jogos"
        description="Todos os jogos bíblicos prontos para usar com sua igreja, célula ou ministério."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/create-game">
              <PlusCircle className="mr-2 size-4" /> Criar jogo
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
        <ComingSoonCard />
        <ComingSoonCard title="Mais jogos em breve" description="Sugestões? Avise sua liderança." />
      </div>
    </div>
  );
}
