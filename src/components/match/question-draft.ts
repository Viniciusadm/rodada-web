import type { MatchMode, MatchQuestion } from "@/lib/api-client";
import type { DraftOption, DraftQuestionType } from "@/lib/match-types";

export type Draft = {
  type: DraftQuestionType;
  prompt: string;
  expectedAnswer: string;
  options: DraftOption[];
  points: number;
};

export function emptyDraft(): Draft {
  return { type: "free_text", prompt: "", expectedAnswer: "", options: [], points: 100 };
}

export function fromQuestion(question: {
  type: MatchQuestion["type"];
  prompt: string;
  expectedAnswer: string;
  options: DraftOption[];
  points: number;
}): Draft {
  const type: DraftQuestionType =
    question.type === "true_false" || question.type === "multiple_choice"
      ? question.type
      : "free_text";
  return {
    type,
    prompt: question.prompt,
    expectedAnswer: question.expectedAnswer,
    options:
      question.options.length > 0
        ? question.options.map((option) => ({ ...option }))
        : [
            { text: "", correct: true },
            { text: "", correct: false },
          ],
    points: question.points,
  };
}

export function draftValid(draft: Draft, mode: MatchMode): boolean {
  if (!draft.prompt.trim()) return false;
  if (mode === "buzzer") return draft.expectedAnswer.trim().length > 0;
  if (draft.type === "true_false")
    return draft.expectedAnswer === "true" || draft.expectedAnswer === "false";
  if (draft.type === "multiple_choice") {
    return (
      draft.options.length >= 2 &&
      draft.options.length <= 4 &&
      draft.options.every((option) => option.text.trim().length > 0) &&
      draft.options.filter((option) => option.correct).length === 1
    );
  }
  return draft.expectedAnswer.trim().length > 0;
}

export function toPayload(draft: Draft, mode: MatchMode) {
  if (mode === "buzzer") {
    return {
      prompt: draft.prompt,
      expectedAnswer: draft.expectedAnswer,
      points: draft.points,
    };
  }
  if (draft.type === "multiple_choice") {
    const correct = draft.options.find((option) => option.correct);
    return {
      questionType: "multiple_choice" as const,
      prompt: draft.prompt,
      expectedAnswer: correct?.text ?? "",
      options: draft.options,
      points: draft.points,
    };
  }
  return {
    questionType: draft.type,
    prompt: draft.prompt,
    expectedAnswer: draft.expectedAnswer,
    points: draft.points,
  };
}
