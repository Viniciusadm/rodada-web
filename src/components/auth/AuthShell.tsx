import { Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import type { ReactNode } from "react";

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex w-full items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <Gamepad2 className="size-5 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">Games Hub</span>
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Voltar para a home
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
              <Gamepad2 className="size-6 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">{children}</div>

          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
