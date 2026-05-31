import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { useLiveRoomsQuery } from "@/features/games-hub-data";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Salas ao vivo — Games Hub" },
      { name: "description", content: "Salas de jogos acontecendo agora na sua comunidade." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { data: rooms = [], isLoading, isError } = useLiveRoomsQuery();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Salas ao vivo"
        description="Entre em uma sala existente ou crie uma nova para reunir seu grupo."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/matches/new">Criar sala</Link>
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Carregando salas ao vivo...
          </div>
        )}
        {isError && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Não foi possível carregar salas ao vivo da API.
          </div>
        )}
        {!isLoading && !isError && rooms.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            Nenhuma sala ao vivo no momento.
          </div>
        )}
        {!isLoading &&
          !isError &&
          rooms.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {r.gameName}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">{r.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Iniciada há {r.startedMinutesAgo} min • Anfitrião: {r.host}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400 ring-1 ring-red-500/20">
                  <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> Ao vivo
                </span>
              </div>

              <div className="my-5 flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">PIN</p>
                  <p className="font-mono text-xl font-semibold tracking-widest">{r.pin}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard?.writeText(r.pin);
                    toast.success("PIN copiado");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5" /> {r.participants} participantes
                  </span>
                  <span className="text-muted-foreground">
                    {r.participants}/{r.capacity}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                    style={{ width: `${r.capacity ? (r.participants / r.capacity) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <Button asChild className="w-full rounded-lg">
                <Link to="/play/$matchId" params={{ matchId: r.matchId }}>
                  Entrar na sala
                </Link>
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
