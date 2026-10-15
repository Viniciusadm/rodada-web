import { Link } from "@tanstack/react-router";
import { LayoutTemplate, MonitorPlay, Smartphone, type LucideIcon } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

const STEPS: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: LayoutTemplate,
    title: "Monte o modelo",
    description:
      "Escolha entre buzzer ou quiz, escreva as perguntas ou puxe do seu banco de perguntas.",
  },
  {
    icon: MonitorPlay,
    title: "Projete no telão",
    description: "Gere a partida e abra o telão. O PIN da sala aparece grande para todo mundo ver.",
  },
  {
    icon: Smartphone,
    title: "Jogue pelo celular",
    description: "Cada participante entra com o PIN, responde na hora e o placar atualiza ao vivo.",
  },
];

const DEMO_OPTIONS = [
  { label: "Marte", votes: 3 },
  { label: "Júpiter", votes: 14, correct: true },
  { label: "Saturno", votes: 6 },
  { label: "Netuno", votes: 1 },
];

const DEMO_SCORES = [
  { team: "Equipe Azul", points: 1840 },
  { team: "Os Sabichões", points: 1610 },
  { team: "Mesa 7", points: 1275 },
];

function AuthActions({ size }: { size: "sm" | "lg" }) {
  const status = useAuthStore((s) => s.status);

  if (status === "authed") {
    return (
      <Button asChild size={size}>
        <Link to="/play">Ir para o painel</Link>
      </Button>
    );
  }

  if (status !== "anon") return null;

  return (
    <>
      <Button asChild size={size}>
        <Link to="/register">Criar conta grátis</Link>
      </Button>
      <Button
        asChild
        size={size}
        variant="outline"
        className="border-white/20 text-white hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
      >
        <Link to="/login">Entrar</Link>
      </Button>
    </>
  );
}

function DemoScreen() {
  const totalVotes = DEMO_OPTIONS.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-[7px] border-b border-white/[0.08] px-3.5 py-[11px]">
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="ml-2 font-mono text-xs text-white/45">PIN 482913</span>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="bg-ink-800 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4 text-sm text-white/55">
            <span>Pergunta 4 de 10</span>
            <span className="font-mono tabular-nums text-brand-300">00:12</span>
          </div>
          <p className="mt-4 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
            Qual é o maior planeta do Sistema Solar?
          </p>
          <ul className="mt-6 space-y-2.5">
            {DEMO_OPTIONS.map((option) => {
              const share = Math.round((option.votes / totalVotes) * 100);
              return (
                <li
                  key={option.label}
                  className={
                    option.correct
                      ? "relative overflow-hidden rounded-[10px] border border-brand-500 px-4 py-3"
                      : "relative overflow-hidden rounded-[10px] border border-white/10 px-4 py-3"
                  }
                >
                  <span
                    className={
                      option.correct
                        ? "absolute inset-y-0 left-0 bg-brand-500/25"
                        : "absolute inset-y-0 left-0 bg-white/[0.05]"
                    }
                    style={{ width: `${share}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-3 text-sm">
                    <span className={option.correct ? "font-semibold text-white" : "text-white/75"}>
                      {option.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-white/55">{share}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-white/[0.08] p-5 sm:p-7 md:border-l md:border-t-0">
          <p className="text-sm font-semibold text-white">Placar</p>
          <ol className="mt-4 space-y-3">
            {DEMO_SCORES.map((row, index) => (
              <li key={row.team} className="flex items-center gap-3">
                <span
                  className={
                    index === 0
                      ? "flex size-7 items-center justify-center rounded-lg bg-brand-500 font-mono text-xs font-bold text-[#0b1220]"
                      : "flex size-7 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-xs text-white/60"
                  }
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[#dde5ef]">{row.team}</span>
                <span className="font-mono text-sm tabular-nums text-brand-300">
                  {row.points.toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-white/[0.08] pt-4 text-xs leading-relaxed text-white/50">
            24 jogadores conectados pelo celular
          </p>
        </div>
      </div>
    </div>
  );
}

export function PublicLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="dark bg-ink-900 text-white">
        <header className="mx-auto flex h-[72px] w-full max-w-[1160px] items-center gap-6 px-4 sm:px-6">
          <Link
            to="/"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
          </Link>
          <nav className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/entrar"
              className="hidden px-2 text-sm text-white/75 transition-colors hover:text-white sm:inline"
            >
              Tenho um PIN
            </Link>
            <AuthActions size="sm" />
          </nav>
        </header>

        <section className="mx-auto grid w-full max-w-[1160px] items-center gap-12 px-4 pb-20 pt-10 sm:px-6 md:pb-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:pt-16">
          <div>
            <span className="inline-block rounded-full border border-brand-500/35 bg-brand-500/12 px-3.5 py-1.5 text-[13px] font-medium text-brand-200">
              Buzzer e quiz em tempo real
            </span>
            <h1 className="mt-5 text-balance text-[clamp(34px,5vw,58px)] font-bold leading-[1.06]">
              A sala toda jogando junto, no telão e no celular.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-white/70">
              Crie a partida, projete as perguntas e deixe cada participante responder pelo próprio
              celular. O placar se atualiza sozinho.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AuthActions size="lg" />
            </div>
          </div>

          <DemoScreen />
        </section>
      </div>

      <section className="mx-auto w-full max-w-[1160px] px-4 py-20 sm:px-6 md:py-24">
        <h2 className="max-w-[24ch] text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1]">
          Da ideia ao placar em três passos
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="relative inline-flex size-[52px] items-center justify-center rounded-[14px] bg-primary-solid text-white">
                <step.icon className="size-6" />
                <b className="absolute -right-2 -top-2 flex size-[22px] items-center justify-center rounded-full border-2 border-background bg-foreground font-mono text-[11px] text-background">
                  {index + 1}
                </b>
              </span>
              <h3 className="mt-5 text-[19px] font-bold">{step.title}</h3>
              <p className="mt-2.5 max-w-[36ch] text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="dot-grid bg-brand-500 text-[#0b1220] [--dot-color:rgba(11,18,32,0.13)]">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold leading-[1.1]">
              Vai jogar agora?
            </h2>
            <p className="mt-2 max-w-[48ch] text-[#0b1220]/75">
              Se alguém já abriu a partida, entre com o PIN que está no telão.
            </p>
          </div>
          <Button asChild size="lg" className="bg-ink-950 text-white hover:bg-ink-800">
            <Link to="/entrar">Entrar com PIN</Link>
          </Button>
        </div>
      </section>

      <footer className="dark bg-ink-950 text-white/70">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo size={26} wordClassName="text-lg text-white" />
          <span className="text-white/50">© {new Date().getFullYear()} Rodada</span>
        </div>
      </footer>
    </div>
  );
}
