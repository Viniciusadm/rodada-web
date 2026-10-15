import type { MatchQuestion, MatchState } from "@/lib/api-client";

export const RANKING_SIZE = 5;

export type MatchSituation = "question" | "result" | "waiting" | "finished";

export function rankingLeaders(state: MatchState) {
  return [...state.participants]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, RANKING_SIZE);
}

export function showsRanking(state: MatchState) {
  const display = state.settings.rankingDisplay;
  if (display === "always") return true;
  if (display === "end_only") return state.match.status === "encerrada";
  return !state.currentRound?.question;
}

export function situationOf(state: MatchState): MatchSituation {
  if (state.currentRound?.question) return "question";
  if (state.match.status === "em-andamento" && state.lastRoundResult) return "result";
  if (state.match.status === "encerrada") return "finished";
  return "waiting";
}

export function headlineOf(state: MatchState) {
  if (state.match.status === "encerrada") return "Partida encerrada";
  if (state.match.status === "em-andamento") return "Aguardando próxima pergunta";
  return "Aguardando início";
}

export function answerLabel(question: MatchQuestion | null | undefined) {
  if (question?.type === "true_false") {
    return question.expectedAnswer === "true" ? "Verdadeiro" : "Falso";
  }
  return question?.expectedAnswer ?? "";
}

export function statusLine(state: MatchState) {
  if (state.settings.mode !== "buzzer") return "Os jogadores respondem pelo celular";
  const round = state.currentRound;
  const selected = state.participants.find((player) => player.id === round?.selectedParticipantId);
  return selected
    ? `${selected.displayName} respondeu primeiro`
    : "Aguardando resposta dos jogadores";
}
