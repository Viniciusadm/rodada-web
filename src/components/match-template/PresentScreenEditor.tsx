import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Code2, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { externState } from "@ribaltalang/player/extern";
import { RendererHostContext } from "@ribaltalang/renderer/host";
import { PageView, ScaledPage } from "@ribaltalang/renderer/PageView";
import "@ribaltalang/renderer/styles.css";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RibaltaCodeEditor, type RibaltaEditorHandle } from "./RibaltaCodeEditor";
import { CUSTOM_SCREEN, ScreenTemplateGallery } from "./ScreenTemplateGallery";
import { ScreenVariablesPanel } from "./ScreenVariablesPanel";
import {
  checkPresentScreen,
  declarationInsertion,
  getScreenContract,
  getScreenTemplates,
  presentScreenHost,
  type ScreenCheck,
  type ScreenTemplate,
  type ScreenVariable,
} from "@/lib/present-screen";

const CHECK_DELAY_MS = 400;

const SCENES = [
  { label: "Pergunta", values: { status: "question", revealed: false } },
  {
    label: "Resposta revelada",
    values: { status: "question", revealed: true, has_timer: false },
  },
  { label: "Acerto", values: { status: "result", was_correct: true } },
  { label: "Erro", values: { status: "result", was_correct: false, points_earned: 0 } },
  { label: "Aguardando", values: { status: "waiting", headline: "Aguardando próxima pergunta" } },
  {
    label: "Encerrada",
    values: { status: "finished", headline: "Partida encerrada", winner: "Ana" },
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
  const [editing, setEditing] = useState(false);
  const [scene, setScene] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const editor = useRef<RibaltaEditorHandle>(null);
  const contract = useQuery({
    queryKey: ["present-screen-contract"],
    queryFn: getScreenContract,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const templates = useQuery({
    queryKey: ["present-screen-templates"],
    queryFn: getScreenTemplates,
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

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!editing) setFullscreen(false);
  }, [editing]);

  const defaultTemplate = templates.data?.[0];
  const selected =
    value === null
      ? (defaultTemplate?.id ?? null)
      : (templates.data?.find((template) => template.source === value)?.id ?? CUSTOM_SCREEN);

  function pick(template: ScreenTemplate) {
    onChange(!editing && template.id === defaultTemplate?.id ? null : template.source);
  }

  function startEditing() {
    if (value === null && defaultTemplate) onChange(defaultTemplate.source);
    setEditing(true);
  }

  const page = check?.document.pages[0];
  const problems = useMemo(() => check?.diagnostics ?? [], [check]);
  const sceneState = useMemo(
    () => (check ? externState(check.document, SCENES[scene]?.values ?? {}).state : {}),
    [check, scene],
  );
  const variables = useMemo(() => (check ? Object.keys(check.document.state ?? {}) : []), [check]);
  const declared = useMemo(() => check?.document.externs ?? [], [check]);

  function declarationOf(variable: ScreenVariable) {
    return declarationInsertion(value ?? "", variable.declaration);
  }

  function declare(variable: ScreenVariable) {
    editor.current?.insert([declarationOf(variable)]);
  }

  function use(variable: ScreenVariable) {
    const usage = { text: `$${variable.name}` };
    editor.current?.insert(
      declared.includes(variable.name) ? [usage] : [declarationOf(variable), usage],
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Visual do telão</p>
          <p className="text-xs text-muted-foreground">
            Clique em um modelo para usar nas partidas. Se quiser mudar algo, edite o código.
          </p>
        </div>
        {editing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setEditing(false)}
          >
            <X className="mr-1 size-3.5" /> Fechar editor
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={!defaultTemplate}
            onClick={startEditing}
          >
            <Code2 className="mr-1 size-3.5" /> Editar código
          </Button>
        )}
      </div>

      <ScreenTemplateGallery
        templates={templates.data}
        loading={templates.isLoading}
        selected={selected}
        custom={selected === CUSTOM_SCREEN ? (check?.document ?? null) : null}
        onPick={pick}
      />

      {editing && value !== null && (
        <div
          className={cn(
            "grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
            fullscreen &&
              "fixed inset-0 z-50 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-4 bg-background p-4",
          )}
        >
          <div className={cn("space-y-2", fullscreen && "flex min-h-0 flex-col")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="screen-source">Texto do telão</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setFullscreen((current) => !current)}
                >
                  {fullscreen ? (
                    <>
                      <Minimize2 className="mr-1 size-3.5" /> Sair da tela cheia
                    </>
                  ) : (
                    <>
                      <Maximize2 className="mr-1 size-3.5" /> Tela cheia
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div
              id="screen-source"
              className={cn(
                "rounded-xl border border-input bg-background/40 focus-within:ring-2 focus-within:ring-ring",
                fullscreen ? "min-h-0 flex-1" : "h-[70vh] min-h-[520px]",
              )}
            >
              <RibaltaCodeEditor
                ref={editor}
                value={value}
                onChange={onChange}
                diagnostics={problems}
                theme={check?.document.theme ?? null}
                variables={variables}
                externs={contract.data ?? []}
              />
            </div>
          </div>

          <div
            className={cn(
              "space-y-3",
              fullscreen ? "min-h-0 overflow-y-auto pr-1" : "self-start xl:sticky xl:top-4",
            )}
          >
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
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => setScene(index)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
              {check && page && (
                <RendererHostContext.Provider value={presentScreenHost}>
                  <ScaledPage width={page.width} height={page.height}>
                    <PageView doc={check.document} page={page} state={sceneState} />
                  </ScaledPage>
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
            <div className="space-y-2 pt-2">
              <Label>Variáveis do hub</Label>
              <ScreenVariablesPanel
                variables={contract.data ?? []}
                declared={declared}
                onDeclare={declare}
                onUse={use}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
