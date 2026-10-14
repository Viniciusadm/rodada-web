import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { externState } from "@ribaltalang/player/extern";
import { RendererHostContext } from "@ribaltalang/renderer/host";
import { ScaledSlide, SlideView } from "@ribaltalang/renderer/SlideView";
import "@ribaltalang/renderer/styles.css";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RibaltaCodeEditor } from "./RibaltaCodeEditor";
import {
  checkPresentScreen,
  getScreenContract,
  getDefaultScreenSource,
  presentScreenHost,
  type ScreenCheck,
} from "@/lib/present-screen";

const CHECK_DELAY_MS = 400;

const SCENES = [
  { label: "Pergunta", values: { situacao: "pergunta", revelada: false } },
  {
    label: "Resposta revelada",
    values: { situacao: "pergunta", revelada: true, cronometro: false },
  },
  { label: "Resultado", values: { situacao: "resultado" } },
  {
    label: "Encerrada",
    values: { situacao: "encerrada", titulo: "Partida encerrada", vencedor: "Ana" },
  },
];

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  onValidityChange: (valid: boolean) => void;
};

export function PresentScreenEditor({ value, onChange, onValidityChange }: Props) {
  const [check, setCheck] = useState<ScreenCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [scene, setScene] = useState(0);
  const contract = useQuery({
    queryKey: ["present-screen-contract"],
    queryFn: getScreenContract,
    staleTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (value === null) {
      setCheck(null);
      onValidityChange(true);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const timer = setTimeout(() => {
      checkPresentScreen(value)
        .then((result) => {
          if (cancelled) return;
          setCheck(result);
          onValidityChange(result.valid);
        })
        .catch(() => {
          if (!cancelled) onValidityChange(false);
        })
        .finally(() => {
          if (!cancelled) setChecking(false);
        });
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, onValidityChange]);

  async function loadDefault() {
    setLoadingDefault(true);
    try {
      onChange(await getDefaultScreenSource());
    } finally {
      setLoadingDefault(false);
    }
  }

  const slide = check?.deck.slides[0];
  const problems = useMemo(() => check?.diagnostics ?? [], [check]);
  const sceneState = useMemo(
    () => (check ? externState(check.deck, SCENES[scene]?.values ?? {}).state : {}),
    [check, scene],
  );
  const variables = useMemo(() => (check ? Object.keys(check.deck.state ?? {}) : []), [check]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <div>
          <Label htmlFor="custom-screen" className="text-sm font-medium">
            Telão personalizado
          </Label>
          <p className="text-xs text-muted-foreground">
            Escreva o telão em Ribalta. Desligado, as partidas usam o telão padrão do hub.
          </p>
        </div>
        <Switch
          id="custom-screen"
          checked={value !== null}
          disabled={loadingDefault}
          onCheckedChange={(checked) => (checked ? void loadDefault() : onChange(null))}
        />
      </div>

      {value !== null && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-source">Texto do telão</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg"
                disabled={loadingDefault}
                onClick={() => void loadDefault()}
              >
                <RotateCcw className="mr-1 size-3.5" /> Restaurar padrão
              </Button>
            </div>
            <div
              id="screen-source"
              className="h-[520px] rounded-xl border border-input bg-background/40 focus-within:ring-2 focus-within:ring-ring"
            >
              <RibaltaCodeEditor
                value={value}
                onChange={onChange}
                diagnostics={problems}
                theme={check?.deck.theme ?? null}
                variables={variables}
                externs={contract.data ?? []}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Prévia</Label>
              {checking ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : check?.valid ? (
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3.5" /> Pronto para usar
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SCENES.map((option, index) => (
                <Button
                  key={option.label}
                  type="button"
                  size="sm"
                  variant={index === scene ? "default" : "outline"}
                  className={cn("h-7 rounded-full px-3 text-xs")}
                  onClick={() => setScene(index)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
              {check && slide && (
                <RendererHostContext.Provider value={presentScreenHost}>
                  <ScaledSlide width={check.deck.meta.width} height={check.deck.meta.height}>
                    <SlideView deck={check.deck} slide={slide} state={sceneState} />
                  </ScaledSlide>
                </RendererHostContext.Provider>
              )}
            </div>
            {problems.length > 0 && (
              <ul className="space-y-2">
                {problems.map((problem, index) => (
                  <li
                    key={`${problem.code}-${problem.line}-${index}`}
                    className={
                      problem.severity === "error"
                        ? "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm"
                        : "rounded-lg border border-border bg-muted/40 p-3 text-sm"
                    }
                  >
                    <p className="flex items-start gap-2 font-medium">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Linha {problem.line}: {problem.message}
                      </span>
                    </p>
                    {problem.hint && (
                      <p className="mt-1 pl-6 text-xs text-muted-foreground">{problem.hint}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
