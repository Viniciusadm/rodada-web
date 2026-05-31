import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Gamepad2,
  Radio,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Gamepad2,
    title: "Jogos bíblicos prontos",
    description:
      "Uma coleção de experiências interativas para usar em cultos, células e eventos da igreja.",
  },
  {
    icon: Radio,
    title: "Salas ao vivo",
    description:
      "Crie partidas em tempo real e convide participantes via PIN, presencial ou remoto.",
  },
  {
    icon: Trophy,
    title: "Ranking e engajamento",
    description:
      "Acompanhe a pontuação dos jogadores e ministérios para fortalecer a comunidade.",
  },
  {
    icon: Users,
    title: "Multi-organização",
    description:
      "Gerencie sua igreja com papéis de apresentador, administrador e membro.",
  },
];

export function PublicLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">HolyPlay</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hub de jogos cristãos
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/register">Criar conta</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-8 md:p-12">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 size-64 rounded-full bg-primary-glow/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Para igrejas e ministérios
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Jogos bíblicos interativos para edificar sua comunidade
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Crie partidas ao vivo, engaje participantes presenciais e remotos e acompanhe o
              ranking da sua igreja em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/register">
                  Começar gratuitamente <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Tudo que você precisa para uma partida memorável
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Ferramentas pensadas para apresentadores de igreja, sem complicação.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-5"
              >
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
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
            Crie sua conta em poucos segundos e prepare a primeira partida para o próximo culto.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/register">Criar conta</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} HolyPlay</span>
          <span>Hub de jogos cristãos para sua igreja.</span>
        </div>
      </footer>
    </div>
  );
}
