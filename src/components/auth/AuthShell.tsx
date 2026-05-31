import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20"
            aria-label="HolyPlay — voltar para a home"
          >
            <Sparkles className="size-6 text-primary-foreground" />
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
