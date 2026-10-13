import type { ExternSuggestion } from "@folio/codemirror/completions";
import type { Deck } from "@folio/compiler";
import type { RendererHost } from "@folio/renderer/host";
import { request, requestRaw, type MatchState } from "@/lib/api-client";
import {
  answerLabel,
  headlineOf,
  rankingLeaders,
  showsRanking,
  situationOf,
  statusLine,
} from "@/lib/match-display";

export const presentScreenHost: RendererHost = {
  asset: () => "",
};

export type ScreenDiagnostic = {
  severity: "error" | "warning";
  code: string;
  message: string;
  line: number;
  column: number;
  endColumn: number;
  hint?: string;
};

export type ScreenCheck = {
  valid: boolean;
  deck: Deck;
  diagnostics: ScreenDiagnostic[];
};

export function getMatchScreen(matchId: string): Promise<Deck> {
  return request<Deck>(`/api/v1/matches/${matchId}/screen`, { auth: false });
}

export async function getDefaultScreenSource(): Promise<string> {
  const response = await requestRaw("/api/v1/screens/present/source", { auth: false });
  return response.text();
}

export function getScreenContract(): Promise<ExternSuggestion[]> {
  return request<ExternSuggestion[]>("/api/v1/screens/present/contract", { auth: false });
}

export function checkPresentScreen(source: string): Promise<ScreenCheck> {
  return request<ScreenCheck>("/api/v1/screens/present/check", {
    method: "POST",
    body: { source },
  });
}

export function presentScreenValues(
  state: MatchState,
  seconds: number | null,
): Record<string, unknown> {
  const round = state.currentRound;
  const question = round?.question ?? null;
  const type = question?.type ?? "buzzer";
  const leaders = rankingLeaders(state);
  const options = type === "multiple_choice" ? (question?.options ?? []) : [];
  const result = state.lastRoundResult;

  return {
    partida: state.match.name,
    situacao: situationOf(state),
    rodada: round?.roundNumber ?? 0,
    cronometro: round?.status === "open" && round.timeRemainingSeconds !== null,
    tempo: seconds ?? 0,
    pergunta: question?.prompt ?? "",
    revelada: round?.answerRevealed ?? false,
    resposta: answerLabel(question),
    aviso: statusLine(state),
    acertou: result?.result === "correct",
    jogador: result?.displayName ?? "Jogador",
    ganhos: result?.result === "correct" ? result.pointsApplied : 0,
    titulo: headlineOf(state),
    vencedor: state.winner?.displayName ?? "",
    mostrar_placar: showsRanking(state),
    opcoes: options.map((option) => ({ texto: option.text, correta: option.correct })),
    placar: leaders.map((player) => ({
      nome: player.displayName,
      pontos: player.currentScore,
      fora: player.eliminated || Boolean(round?.earlyParticipantIds.includes(player.id)),
    })),
  };
}
