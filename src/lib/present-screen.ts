import type { ExternSuggestion } from "@folio/codemirror/completions";
import type { Deck } from "@folio/compiler";
import type { RendererHost } from "@folio/renderer/host";
import { getAccessToken, getApiBaseUrl, type MatchState } from "@/lib/api-client";

const RANKING_SIZE = 5;

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

async function screenRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(new URL(path, getApiBaseUrl()), { ...init, headers });
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response;
}

export async function getMatchScreen(matchId: string): Promise<Deck> {
  const response = await screenRequest(`/api/v1/matches/${matchId}/screen`, {
    headers: { accept: "application/json" },
  });
  return response.json() as Promise<Deck>;
}

export async function getDefaultScreenSource(): Promise<string> {
  const response = await screenRequest("/api/v1/screens/present/source");
  return response.text();
}

export async function getScreenContract(): Promise<ExternSuggestion[]> {
  const response = await screenRequest("/api/v1/screens/present/contract", {
    headers: { accept: "application/json" },
  });
  return response.json() as Promise<ExternSuggestion[]>;
}

export async function checkPresentScreen(source: string): Promise<ScreenCheck> {
  const response = await screenRequest("/api/v1/screens/present/check", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ source }),
  });
  return response.json() as Promise<ScreenCheck>;
}

function situationOf(state: MatchState) {
  if (state.currentRound?.question) return "pergunta";
  if (state.match.status === "em-andamento" && state.lastRoundResult) return "resultado";
  return "aguardando";
}

function headlineOf(state: MatchState) {
  if (state.match.status === "encerrada") return "Partida encerrada";
  if (state.match.status === "em-andamento") return "Aguardando próxima pergunta";
  return "Aguardando início";
}

function showsRanking(state: MatchState) {
  const display = state.settings.rankingDisplay;
  if (display === "always") return true;
  if (display === "end_only") return state.match.status === "encerrada";
  return !state.currentRound?.question;
}

export function presentScreenValues(
  state: MatchState,
  seconds: number | null,
): Record<string, unknown> {
  const round = state.currentRound;
  const question = round?.question ?? null;
  const type = question?.type ?? "buzzer";
  const selected = state.participants.find((player) => player.id === round?.selectedParticipantId);
  const leaders = [...state.participants]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, RANKING_SIZE);
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
    resposta:
      type === "true_false"
        ? question?.expectedAnswer === "true"
          ? "Verdadeiro"
          : "Falso"
        : (question?.expectedAnswer ?? ""),
    aviso:
      state.settings.mode === "buzzer"
        ? selected
          ? `${selected.displayName} respondeu primeiro`
          : "Aguardando resposta dos jogadores"
        : "Os jogadores respondem pelo celular",
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
