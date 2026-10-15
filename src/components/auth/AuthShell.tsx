import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Logo } from "@/components/common/Logo";

const SHOWCASE_SCORES = [
  { team: "Equipe Azul", points: 1840 },
  { team: "Os Sabichões", points: 1610 },
  { team: "Mesa 7", points: 1275 },
  { team: "Turma da Frente", points: 980 },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="dark grid min-h-dvh bg-ink-950 text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-w-0 flex-col px-5 pb-8 pt-6 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar para a home
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center pb-6 pt-12">
          <h1 className="text-[clamp(28px,4vw,36px)] font-bold leading-[1.1] tracking-[-0.025em] text-white">
            {title}
          </h1>
          <p className="mb-8 mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          {children}

          <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            {footer}
          </p>
        </main>
      </div>

      <aside
        aria-hidden
        className="dot-grid sticky top-0 hidden h-dvh flex-col justify-center gap-12 overflow-hidden bg-brand-500 px-[clamp(36px,4.5vw,72px)] text-[#0b1220] lg:flex"
      >
        <div>
          <h2 className="max-w-[16ch] text-[clamp(30px,3vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">
            A sala inteira no mesmo placar.
          </h2>
          <p className="mt-3.5 max-w-[44ch] text-base leading-relaxed text-[#0b1220]/75">
            Monte a partida, projete no telão e deixe cada jogador responder pelo celular.
          </p>
        </div>

        <div className="max-w-md overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-[0_30px_80px_rgba(11,18,32,0.35)]">
          <div className="flex items-center gap-[7px] border-b border-white/[0.08] px-3.5 py-[11px]">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="ml-2 font-mono text-xs text-white/45">placar ao vivo</span>
          </div>
          <ol className="divide-y divide-white/[0.06]">
            {SHOWCASE_SCORES.map((row, index) => (
              <li key={row.team} className="flex items-center gap-3 px-4 py-3 text-[#dde5ef]">
                <span
                  className={
                    index === 0
                      ? "flex size-7 items-center justify-center rounded-lg bg-brand-500 font-mono text-xs font-bold text-[#0b1220]"
                      : "flex size-7 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-xs text-white/60"
                  }
                >
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{row.team}</span>
                <span className="font-mono text-sm tabular-nums text-brand-300">
                  {row.points.toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
