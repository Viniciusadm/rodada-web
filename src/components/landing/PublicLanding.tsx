import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Gamepad2,
  LayoutDashboard,
  Link2,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

const FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Gamepad2,
    title: "Jogos prontos",
    description: "Uma coleção de experiências interativas para usar em encontros, aulas e eventos.",
  },
  {
    icon: Link2,
    title: "Entre por link",
    description: "Crie a partida e convide participantes por um link único — presencial ou remoto.",
  },
  {
    icon: Trophy,
    title: "Placar ao vivo",
    description: "Acompanhe a pontuação dos jogadores em tempo real durante a partida.",
  },
  {
    icon: Zap,
    title: "Tempo real",
    description: "Buzzer e quizzes sincronizados ao vivo para todos os participantes.",
  },
];

export function PublicLanding() {
  const status = useAuthStore((s) => s.status);
  const isAuthed = status === "authed";
  const isAnon = status === "anon";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <Gamepad2 className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">Games Hub</span>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthed && (
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/play">
                <LayoutDashboard className="mr-1.5 size-4" /> Ir para o painel
              </Link>
            </Button>
          )}
          {isAnon && (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl">
                <Link to="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12">
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Para apresentadores de jogos
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Jogos interativos para reunir o seu grupo
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Crie uma partida, compartilhe o link único e reúna participantes presenciais e remotos
              em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isAuthed && (
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/play">
                    Ir para o painel <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              )}
              {isAnon && (
                <>
                  <Button asChild size="lg" className="rounded-xl">
                    <Link to="/register">
                      Começar gratuitamente <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl">
                    <Link to="/login">Já tenho conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Tudo que você precisa para uma partida memorável
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Ferramentas pensadas para apresentadores de jogos, sem complicação.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card p-8 text-center md:p-10">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Pronto para começar?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
            Crie sua conta em poucos segundos e prepare a primeira partida para o próximo evento.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isAuthed && (
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/play">Ir para o painel</Link>
              </Button>
            )}
            {isAnon && (
              <>
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/register">Criar conta</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link to="/login">Entrar</Link>
                </Button>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} Games Hub</span>
          <span>Hub de jogos.</span>
        </div>
      </footer>
    </div>
  );
}
