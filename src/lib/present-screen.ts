import type { ExternSuggestion } from "@ribaltalang/codemirror/completions";
import type { Document } from "@ribaltalang/compiler";
import type { RendererHost } from "@ribaltalang/renderer/host";
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
  document: Document;
  diagnostics: ScreenDiagnostic[];
};

export function getMatchScreen(matchId: string): Promise<Document> {
  return request<Document>(`/api/v1/matches/${matchId}/screen`, { auth: false });
}

export async function getDefaultScreenSource(): Promise<string> {
  const response = await requestRaw("/api/v1/screens/present/source", { auth: false });
  return response.text();
}

export type ScreenVariable = ExternSuggestion & {
  kind: string;
  description: string;
  example: string;
  fields?: { name: string; kind: string }[];
};

export type ScreenTemplate = {
  id: string;
  name: string;
  description: string;
  source: string;
  document: Document;
};

export function getScreenContract(): Promise<ScreenVariable[]> {
  return request<ScreenVariable[]>("/api/v1/screens/present/contract", { auth: false });
}

export function getScreenTemplates(): Promise<ScreenTemplate[]> {
  return request<ScreenTemplate[]>("/api/v1/screens/present/templates", { auth: false });
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
    match_name: state.match.name,
    status: situationOf(state),
    round: round?.roundNumber ?? 0,
    has_timer: round?.status === "open" && round.timeRemainingSeconds !== null,
    seconds_left: seconds ?? 0,
    question: question?.prompt ?? "",
    revealed: round?.answerRevealed ?? false,
    answer: answerLabel(question),
    notice: statusLine(state),
    was_correct: result?.result === "correct",
    player: result?.displayName ?? "Jogador",
    points_earned: result?.result === "correct" ? result.pointsApplied : 0,
    headline: headlineOf(state),
    winner: state.winner?.displayName ?? "",
    show_scoreboard: showsRanking(state),
    options: options.map((option) => ({ text: option.text, correct: option.correct })),
    scoreboard: leaders.map((player) => ({
      name: player.displayName,
      points: player.currentScore,
      out: player.eliminated || Boolean(round?.earlyParticipantIds.includes(player.id)),
    })),
  };
}

export function declaredValues(doc: Document, values: Record<string, unknown>) {
  const declared = new Set(doc.externs ?? []);
  return Object.fromEntries(Object.entries(values).filter(([name]) => declared.has(name)));
}

const HEADER_DIRECTIVES = ["@title", "@theme", "@color", "@font", "@page", "@mode"];

export function declarationInsertion(source: string, declaration: string) {
  const lines = source.split("\n");
  let anchor = -1;
  lines.forEach((line, index) => {
    if (line.trimStart().startsWith("@extern")) anchor = index;
  });
  if (anchor === -1) {
    lines.forEach((line, index) => {
      const trimmed = line.trimStart();
      if (
        index === anchor + 1 &&
        (trimmed === "" || HEADER_DIRECTIVES.some((d) => trimmed.startsWith(d)))
      ) {
        anchor = index;
      }
    });
    while (anchor >= 0 && lines[anchor]?.trim() === "") anchor -= 1;
  }
  if (anchor === -1) return { text: `${declaration}\n\n`, at: 0 };
  const at = lines.slice(0, anchor + 1).reduce((offset, line) => offset + line.length + 1, 0);
  if (at > source.length) return { text: `\n${declaration}\n`, at: source.length };
  return { text: `${declaration}\n`, at };
}
