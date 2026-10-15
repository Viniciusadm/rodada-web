import { useMemo, useState } from "react";
import { Check, Plus, Search, TextCursorInput } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScreenVariable } from "@/lib/present-screen";

type Props = {
  variables: ScreenVariable[];
  declared: string[];
  onDeclare: (variable: ScreenVariable) => void;
  onUse: (variable: ScreenVariable) => void;
};

export function ScreenVariablesPanel({ variables, declared, onDeclare, onUse }: Props) {
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return variables;
    return variables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(term) ||
        variable.description.toLowerCase().includes(term),
    );
  }, [filter, variables]);

  return (
    <div className="space-y-4">
      <ol className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <li className="flex gap-2">
          <span className="font-semibold text-primary">1.</span>
          <span>
            Declare no topo:{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              @extern status = question
            </code>
            . O valor depois do <code className="font-mono text-xs">=</code> é só um exemplo para a
            prévia.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-primary">2.</span>
          <span>
            Use no texto com{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">$status</code>, em condições
            como{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              ::: if $status == question
            </code>{" "}
            ou em listas com{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              ::: for person in $scoreboard
            </code>
            .
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-primary">3.</span>
          <span>No telão ao vivo, o hub troca cada variável pelo valor real da partida.</span>
        </li>
      </ol>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Buscar variável"
          className="pl-9"
        />
      </div>

      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto rounded-xl border border-border">
        {visible.map((variable) => {
          const isDeclared = declared.includes(variable.name);
          return (
            <li key={variable.name} className="space-y-2 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-sm font-semibold">${variable.name}</code>
                  <Badge variant="secondary" className="font-normal">
                    {variable.kind}
                  </Badge>
                  {isDeclared && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <Check className="size-3.5" /> Declarada
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {!isDeclared && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg px-2 text-xs"
                      onClick={() => onDeclare(variable)}
                    >
                      <Plus className="mr-1 size-3.5" /> Declarar
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-lg px-2 text-xs"
                    onClick={() => onUse(variable)}
                  >
                    <TextCursorInput className="mr-1 size-3.5" /> Usar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{variable.description}</p>
              {variable.fields && (
                <p className="text-xs text-muted-foreground">
                  Cada item tem{" "}
                  {variable.fields.map((field, index) => (
                    <span key={field.name}>
                      {index > 0 && ", "}
                      <code className="font-mono text-foreground">.{field.name}</code> ({field.kind}
                      )
                    </span>
                  ))}
                </p>
              )}
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">Nenhuma variável encontrada.</li>
        )}
      </ul>
    </div>
  );
}
