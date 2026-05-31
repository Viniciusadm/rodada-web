import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Criar conta — HolyPlay" },
      {
        name: "description",
        content: "Crie sua conta no HolyPlay e comece a apresentar jogos bíblicos na sua igreja.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Informe seu nome (mínimo 2 caracteres).")
      .max(100, "Nome muito longo."),
    email: z.string().trim().email("Informe um e-mail válido.").max(255),
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .max(128, "Senha muito longa."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function RegisterPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const register = useAuthStore((s) => s.register);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    const parsed = schema.safeParse({ displayName, email, password, confirmPassword });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        displayName: parsed.data.displayName,
        email: parsed.data.email,
        password: parsed.data.password,
      });
    } catch {
      // surfaced via store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a apresentar jogos bíblicos na sua igreja."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="displayName"
          label="Nome"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Seu nome"
          error={fieldErrors.displayName}
          required
        />
        <AuthField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@igreja.com"
          error={fieldErrors.email}
          required
        />
        <AuthField
          id="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo de 8 caracteres"
          error={fieldErrors.password}
          required
        />
        <AuthField
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repita a senha"
          error={fieldErrors.confirmPassword}
          required
        />

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
