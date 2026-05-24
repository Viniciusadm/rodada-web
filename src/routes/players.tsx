import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { players } from "@/lib/mock-data";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Jogadores — HolyPlay" },
      { name: "description", content: "Membros da igreja participando da HolyPlay." },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Jogadores"
        description="Todos os membros ativos da sua igreja registrados na HolyPlay."
        actions={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar jogador..." className="h-10 rounded-lg pl-9" />
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {players.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40">
            <div className="flex items-center gap-3">
              <div className={`flex size-12 items-center justify-center rounded-full text-sm font-semibold ${p.color}`}>
                {p.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.ministry}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
              <div>
                <p className="text-sm font-semibold tabular-nums">{p.points.toLocaleString("pt-BR")}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pontos</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums">{p.matches}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partidas</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-primary">Nv {p.level}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nível</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
