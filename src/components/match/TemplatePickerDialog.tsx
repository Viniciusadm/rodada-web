import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Library, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listGeneralQuestions, type GeneralQuestion } from "@/lib/api-client";

const PAGE_SIZE = 8;

const TYPE_LABEL: Record<GeneralQuestion["type"], string> = {
  buzzer: "Buzzer",
  multiple_choice: "Múltipla escolha",
  true_false: "V ou F",
  free_text: "Texto",
};

export function TemplatePickerDialog({
  onAdd,
  triggerLabel = "Do banco",
}: {
  onAdd: (questions: GeneralQuestion[]) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, GeneralQuestion>>(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebounced("");
      setPage(1);
      setSelected(new Map());
    }
  }, [open]);

  const query = useQuery({
    queryKey: ["general-questions", "picker", debounced, page],
    queryFn: () => listGeneralQuestions({ search: debounced, page, pageSize: PAGE_SIZE }),
    enabled: open,
  });

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [query.data?.total]);

  const toggle = (question: GeneralQuestion) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(question.id)) next.delete(question.id);
      else next.set(question.id, question);
      return next;
    });
  };

  const confirm = () => {
    if (selected.size === 0) return;
    onAdd(Array.from(selected.values()));
    setOpen(false);
  };

  const items = query.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="rounded-lg">
          <Library className="mr-1 size-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar do banco</DialogTitle>
          <DialogDescription>
            Selecione perguntas gerais para copiar para esta partida.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar perguntas..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[320px] space-y-2 overflow-y-auto">
          {query.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma pergunta geral encontrada.
            </p>
          ) : (
            items.map((question) => (
              <label
                key={question.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/40"
              >
                <Checkbox
                  checked={selected.has(question.id)}
                  onCheckedChange={() => toggle(question)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{question.prompt}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TYPE_LABEL[question.type]} · {question.points} pts
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{selected.size} selecionada(s)</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" disabled={selected.size === 0} onClick={confirm}>
            Adicionar {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
