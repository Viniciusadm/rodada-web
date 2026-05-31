import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — HolyPlay" },
      { name: "description", content: "Acesse o hub de jogos cristãos da sua igreja." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const [email, setEmail] = useState(import.meta.env.VITE_DEMO_ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status === "authed") {
      void router.navigate({ to: "/" });
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // error is surfaced via the store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">HolyPlay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre para acessar o hub de jogos da sua igreja.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@igreja.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
