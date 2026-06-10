import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MatchMode } from "@/lib/api-client";
import type { DraftQuestionType } from "@/lib/match-types";
import type { Draft } from "@/components/match/question-draft";

export function QuestionFields({
  mode,
  draft,
  onChange,
  disabled,
}: {
  mode: MatchMode;
  draft: Draft;
  onChange: (draft: Draft) => void;
  disabled?: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  return (
    <div className="space-y-2">
      {mode === "quiz" && (
        <Select
          value={draft.type}
          onValueChange={(v) => {
            const type = v as DraftQuestionType;
            onChange({
              type,
              prompt: draft.prompt,
              points: draft.points,
              expectedAnswer: type === "true_false" ? "true" : "",
              options:
                type === "multiple_choice"
                  ? [
                      { text: "", correct: true },
                      { text: "", correct: false },
                    ]
                  : [],
            });
          }}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
            <SelectItem value="true_false">Verdadeiro ou Falso</SelectItem>
            <SelectItem value="free_text">Texto</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Input
        value={draft.prompt}
        disabled={disabled}
        onChange={(event) => set({ prompt: event.target.value })}
        placeholder={mode === "quiz" && draft.type === "true_false" ? "Afirmação" : "Pergunta"}
      />
      {mode === "buzzer" ? (
        <Input
          value={draft.expectedAnswer}
          disabled={disabled}
          onChange={(event) => set({ expectedAnswer: event.target.value })}
          placeholder="Resposta de referência"
        />
      ) : draft.type === "true_false" ? (
        <Select
          value={draft.expectedAnswer === "true" ? "true" : "false"}
          onValueChange={(v) => set({ expectedAnswer: v })}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verdadeiro</SelectItem>
            <SelectItem value="false">Falso</SelectItem>
          </SelectContent>
        </Select>
      ) : draft.type === "multiple_choice" ? (
        <div className="space-y-2">
          {draft.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={option.correct ? "default" : "outline"}
                className="w-24 shrink-0 justify-center rounded-lg"
                disabled={disabled}
                onClick={() =>
                  set({
                    options: draft.options.map((opt, idx) => ({
                      ...opt,
                      correct: idx === index,
                    })),
                  })
                }
              >
                {option.correct ? (
                  <>
                    <Check className="mr-1 size-4" /> Correta
                  </>
                ) : (
                  "Correta?"
                )}
              </Button>
              <Input
                value={option.text}
                disabled={disabled}
                placeholder={`Opção ${index + 1}`}
                onChange={(event) =>
                  set({
                    options: draft.options.map((opt, idx) =>
                      idx === index ? { ...opt, text: event.target.value } : opt,
                    ),
                  })
                }
              />
              {draft.options.length > 2 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                  onClick={() => set({ options: draft.options.filter((_, idx) => idx !== index) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
          {draft.options.length < 4 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={disabled}
              onClick={() => set({ options: [...draft.options, { text: "", correct: false }] })}
            >
              <Plus className="mr-1 size-4" /> Opção
            </Button>
          )}
        </div>
      ) : (
        <Input
          value={draft.expectedAnswer}
          disabled={disabled}
          onChange={(event) => set({ expectedAnswer: event.target.value })}
          placeholder="Resposta(s) aceitas — separe variações com |"
        />
      )}
      <Input
        type="number"
        min={0}
        value={draft.points}
        disabled={disabled}
        onChange={(event) => set({ points: Number(event.target.value) || 0 })}
        placeholder="Pontos"
      />
    </div>
  );
}
