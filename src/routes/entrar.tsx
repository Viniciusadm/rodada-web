import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ApiError, joinByPin, resumeByPin } from "@/lib/api-client";

type EntrarSearch = { pin?: string };

const STORAGE_PREFIX = "games-hub-participant:";

function findStoredSessionByPin(pin: string): { matchId: string; token: string } | null {
  if (typeof window === "undefined") return null;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as { token?: string; pin?: string };
      if (parsed.pin === pin && parsed.token) {
        return { matchId: key.slice(STORAGE_PREFIX.length), token: parsed.token };
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
  return null;
}

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [{ title: "Entrar com PIN — Rodada" }],
  }),
  validateSearch: (search: Record<string, unknown>): EntrarSearch => {
    const pin = typeof search.pin === "string" ? search.pin.replace(/\D/g, "").slice(0, 6) : "";
    return pin ? { pin } : {};
  },
  component: EntrarPage,
});

/** Mensagens específicas por tipo de falha ao entrar por PIN. */
function joinErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetwork) return "Sem conexão. Verifique sua internet e tente novamente.";
    if (error.status === 404) return "PIN não encontrado. A sala pode ter sido encerrada.";
    if (error.status === 409) {
      return error.message.includes("full")
        ? "Sala lotada. Não há mais vagas nesta partida."
        : "Esse nome já está em uso nesta sala. Escolha outro.";
    }
    if (error.status === 403 || error.status === 422) {
      return "Esta sala não aceita entrada remota.";
    }
    return error.message;
  }
  return "Não foi possível entrar. Tente novamente.";
}

function EntrarPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [pin, setPin] = useState(search.pin ?? "");
  const [name, setName] = useState("");
  const [resuming, setResuming] = useState(
    () => Boolean(search.pin) && Boolean(findStoredSessionByPin(search.pin ?? "")),
  );
  const resumeAttempts = useRef<Set<string>>(new Set());

  const joinMutation = useMutation({
    mutationFn: () => joinByPin(pin, name.trim()),
    onSuccess: (result) => {
      const matchId = result.participant.matchId;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `${STORAGE_PREFIX}${matchId}`,
          JSON.stringify({
            token: result.participantToken,
            participantId: result.participant.id,
            name: result.participant.displayName,
            pin,
          }),
        );
      }
      void navigate({ to: "/play/$matchId", params: { matchId } });
    },
  });

  useEffect(() => {
    if (pin.length !== 6 || resumeAttempts.current.has(pin)) return;
    const stored = findStoredSessionByPin(pin);
    if (!stored) return;
    resumeAttempts.current.add(pin);
    setResuming(true);
    resumeByPin(pin, stored.token)
      .then((result) => {
        const matchId = result.participant.matchId;
        localStorage.setItem(
          `${STORAGE_PREFIX}${matchId}`,
          JSON.stringify({
            token: result.participantToken,
            participantId: result.participant.id,
            name: result.participant.displayName,
            pin,
          }),
        );
        void navigate({ to: "/play/$matchId", params: { matchId } });
      })
      .catch(() => {
        localStorage.removeItem(`${STORAGE_PREFIX}${stored.matchId}`);
        setResuming(false);
      });
  }, [pin, navigate]);

  const canSubmit = pin.length === 6 && name.trim().length > 0 && !joinMutation.isPending;

  if (resuming) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-muted-foreground">
        Retomando sua partida...
      </div>
    );
  }

  return (
    <div className="dot-grid flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 text-center">
      <Logo className="mb-10" />

      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6 text-left shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div>
          <h1 className="text-2xl font-bold">Entrar em uma partida</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Digite o PIN que aparece no telão e o nome que vai no placar.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">PIN da sala</p>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={(value) => setPin(value.replace(/\D/g, ""))}
              onComplete={() => {
                if (name.trim()) joinMutation.mutate();
              }}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-12 w-11 font-mono text-xl font-semibold"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) joinMutation.mutate();
          }}
          placeholder="Seu nome"
        />

        {joinMutation.isError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {joinErrorMessage(joinMutation.error)}
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit}
          onClick={() => joinMutation.mutate()}
        >
          {joinMutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </div>
  );
}
