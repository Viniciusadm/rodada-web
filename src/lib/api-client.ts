import { BookOpenText, CheckCircle2, Gamepad2, Quote, type LucideIcon } from "lucide-react";
import type { MatchQuestionDraft, MatchStatus } from "@/lib/match-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";
export const DEMO_ORGANIZATION_ID =
  import.meta.env.VITE_DEMO_ORGANIZATION_ID ?? "10000000-0000-0000-0000-000000000001";

export type GameStatus = "active" | "beta" | "maintenance" | "coming-soon";

export type Game = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  status: GameStatus;
  players: number;
  modes: GameModeOption[];
};

export type GameModeOption = {
  id: string;
  code: string;
  name: string;
};

export type Player = {
  id: string;
  name: string;
  initials: string;
  ministry: string;
  points: number;
  matches: number;
  level: number;
  color: string;
};

export type RankingEntry = Player & {
  position: number;
};

export type LiveRoom = {
  id: string;
  matchId: string;
  name: string;
  gameId: string;
  gameName: string;
  pin: string;
  participants: number;
  capacity: number;
  host: string;
  startedMinutesAgo: number;
};

export type ApiMatch = {
  id: string;
  organization_id: string;
  game_id: string;
  game_mode_id: string;
  host_user_id: string;
  name: string;
  status: string;
  current_round_id: string | null;
  winner_participant_id: string | null;
};

export type MatchSummary = {
  id: string;
  name: string;
  status: MatchStatus;
  gameId: string;
  gameModeId: string;
  currentRoundId: string | null;
  winnerParticipantId: string | null;
};

export type MatchQuestion = {
  id: string;
  prompt: string;
  expectedAnswer: string;
  points: number;
  used: boolean;
  position: number;
};

export type MatchParticipant = {
  id: string;
  matchId: string;
  playerId: string | null;
  displayName: string;
  joinSource: "local" | "remote";
  currentScore: number;
};

export type MatchRound = {
  id: string;
  matchQuestionId: string | null;
  roundNumber: number;
  status: "open" | "answer_revealed" | "closed";
  selectedParticipantId: string | null;
  answerRevealed: boolean;
  question: MatchQuestion | null;
};

export type MatchState = {
  match: MatchSummary;
  settings: {
    maxRounds: number | null;
    timePerRoundSeconds: number | null;
    initialPoints: number;
    remoteEnabled: boolean;
    capacity: number | null;
  };
  questions: MatchQuestion[];
  participants: MatchParticipant[];
  currentRound: MatchRound | null;
  room: LiveRoom | null;
  winner: MatchParticipant | null;
};

export type JoinMatchResult = {
  participant: MatchParticipant;
  participantToken: string;
};

export type ImportQuestionsResult = {
  created: number;
  invalidRows: Array<{ line: number; reason: string }>;
};

type ApiGame = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  icon_key: string | null;
  modes: GameModeOption[];
};

type ApiPlayer = {
  id: string;
  display_name: string;
  ministry_id: string | null;
  is_active: boolean;
};

type ApiRankingEntry = {
  position: number;
  player_id: string;
  display_name: string;
  ministry_id: string | null;
  total_points: number;
  matches_played: number;
  wins: number;
};

type ApiMatchQuestion = {
  id: string;
  prompt: string;
  expected_answer: string;
  points: number;
  used: boolean;
  position: number;
};

type ApiMatchParticipant = {
  id: string;
  match_id: string;
  player_id: string | null;
  display_name: string;
  join_source: "local" | "remote";
  current_score: number;
};

type ApiMatchRound = {
  id: string;
  match_question_id: string | null;
  round_number: number;
  status: "open" | "answer_revealed" | "closed";
  selected_participant_id: string | null;
  answer_revealed: boolean;
  question: ApiMatchQuestion | null;
};

type ApiLiveRoom = {
  id: string;
  match_id: string;
  match_name: string;
  game_id: string;
  game_name: string;
  pin: string;
  status: string;
  participants: number;
  capacity: number | null;
  host_name: string;
  started_minutes_ago: number;
};

type ApiMatchState = {
  match_data: ApiMatch;
  settings: {
    max_rounds: number | null;
    time_per_round_seconds: number | null;
    initial_points: number;
    remote_enabled: boolean;
    capacity: number | null;
  };
  questions: ApiMatchQuestion[];
  participants: ApiMatchParticipant[];
  current_round: ApiMatchRound | null;
  room: ApiLiveRoom | null;
  winner: ApiMatchParticipant | null;
};

type ApiJoinMatchResult = {
  participant: ApiMatchParticipant;
  participant_token: string;
};

type LoginResponse = {
  access_token: string;
  token_type: "Bearer";
  user_id: string;
  display_name: string;
};

let accessToken: string | null = import.meta.env.VITE_API_TOKEN ?? null;
let loginPromise: Promise<string | null> | null = null;

export async function listGames(): Promise<Game[]> {
  const games = await request<ApiGame[]>("/api/v1/games", { auth: false });
  return games.map(mapGame);
}

export async function listPlayers(organizationId = DEMO_ORGANIZATION_ID): Promise<Player[]> {
  const players = await request<ApiPlayer[]>(`/api/v1/organizations/${organizationId}/players`);
  return players.filter((player) => player.is_active).map(mapPlayer);
}

export async function listRankings(organizationId = DEMO_ORGANIZATION_ID): Promise<RankingEntry[]> {
  const params = new URLSearchParams({ organization_id: organizationId });
  const ranking = await request<ApiRankingEntry[]>(`/api/v1/rankings?${params}`);
  return ranking.map(mapRankingEntry);
}

export async function listLiveRooms(): Promise<LiveRoom[]> {
  const rooms = await request<ApiLiveRoom[]>(
    `/api/v1/organizations/${DEMO_ORGANIZATION_ID}/rooms/live`,
  );
  return rooms.map(mapLiveRoom);
}

export async function listMatches(organizationId = DEMO_ORGANIZATION_ID): Promise<MatchSummary[]> {
  const matches = await request<ApiMatch[]>(`/api/v1/organizations/${organizationId}/matches`);
  return matches.map(mapMatch);
}

export async function getMatch(matchId: string): Promise<MatchSummary> {
  return mapMatch(await request<ApiMatch>(`/api/v1/matches/${matchId}`, { auth: false }));
}

export async function getMatchState(matchId: string): Promise<MatchState> {
  return mapMatchState(
    await request<ApiMatchState>(`/api/v1/matches/${matchId}/state`, { auth: false }),
  );
}

export async function createMatch(input: {
  name: string;
  mode: string;
  maxQuestions?: number;
  timePerQuestion?: number;
  initialPoints?: number;
  remoteEnabled: boolean;
  questions: MatchQuestionDraft[];
  gameId?: string;
  gameModeId?: string;
}): Promise<MatchSummary> {
  const games = await listGames();
  const gameId = input.gameId ?? games[0]?.id;
  if (!gameId) {
    throw new Error("Nenhum jogo disponível na API para criar a partida.");
  }
  const selectedGame = games.find((game) => game.id === gameId) ?? games[0];
  const modeCode =
    input.mode === "pontos-iniciais"
      ? "initial_points"
      : input.mode === "eliminacao"
        ? "elimination"
        : "classic";
  const gameModeId =
    input.gameModeId ??
    selectedGame?.modes.find((mode) => mode.code === modeCode)?.id ??
    selectedGame?.modes[0]?.id;
  if (!gameModeId) {
    throw new Error("Nenhum modo disponível na API para o jogo selecionado.");
  }
  const created = await request<ApiMatch>("/api/v1/matches", {
    method: "POST",
    body: {
      organization_id: DEMO_ORGANIZATION_ID,
      game_id: gameId,
      game_mode_id: gameModeId,
      host_user_id: "resolved-from-token",
      name: input.name,
      max_rounds: input.maxQuestions,
      time_per_round_seconds: input.timePerQuestion,
      initial_points: input.initialPoints,
      remote_enabled: input.remoteEnabled,
      questions: input.questions.map((question) => ({
        source_question_id: null,
        prompt: question.text,
        expected_answer: question.answer,
        points: question.points,
      })),
    },
  });
  return mapMatch(created);
}

export async function addParticipant(matchId: string, displayName: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/participants`, {
    method: "POST",
    body: {
      player_id: null,
      display_name: displayName,
      join_source: "local",
    },
  });
}

export async function addMatchQuestion(
  matchId: string,
  question: { prompt: string; expectedAnswer: string; points: number },
) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions`, {
    method: "POST",
    body: {
      prompt: question.prompt,
      expected_answer: question.expectedAnswer,
      points: question.points,
    },
  });
}

export async function updateMatchQuestion(
  matchId: string,
  questionId: string,
  question: { prompt: string; expectedAnswer: string; points: number },
) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions/${questionId}`, {
    method: "PATCH",
    body: {
      prompt: question.prompt,
      expected_answer: question.expectedAnswer,
      points: question.points,
    },
  });
}

export async function deleteMatchQuestion(matchId: string, questionId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions/${questionId}`, {
    method: "DELETE",
  });
}

export async function importMatchQuestions(
  matchId: string,
  csv: string,
): Promise<ImportQuestionsResult> {
  const result = await request<{
    created: number;
    invalid_rows: Array<{ line: number; reason: string }>;
  }>(`/api/v1/matches/${matchId}/questions/import-csv`, {
    method: "POST",
    body: { csv },
  });
  return { created: result.created, invalidRows: result.invalid_rows };
}

export async function joinMatch(
  matchId: string,
  participantName: string,
): Promise<JoinMatchResult> {
  const result = await request<ApiJoinMatchResult>(`/api/v1/matches/${matchId}/join`, {
    auth: false,
    method: "POST",
    body: { participant_name: participantName },
  });
  return {
    participant: mapParticipant(result.participant),
    participantToken: result.participant_token,
  };
}

export async function sendPlayerAnswer(matchId: string, roundId: string, participantToken: string) {
  return request<{ accepted: boolean }>(
    `/api/v1/matches/${matchId}/rounds/${roundId}/player-answer`,
    {
      auth: false,
      method: "POST",
      body: { participant_token: participantToken },
    },
  );
}

export async function revealAnswer(matchId: string, roundId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/rounds/${roundId}/reveal`, {
    method: "POST",
  });
}

export async function registerAnswer(
  matchId: string,
  roundId: string,
  participantId: string | null,
  result: "correct" | "incorrect" | "skipped",
) {
  await requestNoContent(`/api/v1/matches/${matchId}/rounds/${roundId}/answer`, {
    method: "POST",
    body: {
      participant_id: participantId,
      result,
      actor_user_id: "resolved-from-token",
    },
  });
}

export async function adjustScore(
  matchId: string,
  participantId: string,
  delta: number,
  reason?: string,
) {
  await requestNoContent(`/api/v1/matches/${matchId}/participants/${participantId}/score`, {
    method: "POST",
    body: {
      delta,
      reason,
      actor_user_id: "resolved-from-token",
    },
  });
}

export async function startMatch(matchId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/start`, { method: "POST" });
}

export async function drawMatchQuestion(matchId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/draw`, { method: "POST" });
}

export async function endMatch(matchId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/end`, { method: "POST" });
}

export async function resetMatch(matchId: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/reset`, { method: "POST" });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

async function request<T>(
  path: string,
  options: { auth?: boolean; method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await requestRaw(path, options);
  return response.json() as Promise<T>;
}

async function requestNoContent(
  path: string,
  options: { auth?: boolean; method?: string; body?: unknown } = {},
) {
  await requestRaw(path, options);
}

async function requestRaw(
  path: string,
  options: { auth?: boolean; method?: string; body?: unknown } = {},
): Promise<Response> {
  const headers = new Headers({ accept: "application/json" });
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return response;
}

async function getAccessToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  const email = import.meta.env.VITE_DEMO_ADMIN_EMAIL;
  const password = import.meta.env.VITE_DEMO_ADMIN_PASSWORD;
  if (!email || !password) return null;

  loginPromise ??= login(email, password)
    .then((token) => {
      accessToken = token;
      return token;
    })
    .catch(() => null)
    .finally(() => {
      loginPromise = null;
    });
  return loginPromise;
}

async function login(email: string, password: string): Promise<string> {
  const response = await fetch(new URL("/api/v1/auth/login", API_BASE_URL), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }
  const payload = (await response.json()) as LoginResponse;
  return payload.access_token;
}

async function errorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? `API request failed with ${response.status}`;
  } catch {
    return `API request failed with ${response.status}`;
  }
}

function mapGame(game: ApiGame): Game {
  const visual = gameVisual(game.icon_key ?? game.slug);
  return {
    id: game.id,
    name: game.name,
    description: game.description,
    icon: visual.icon,
    iconColor: visual.iconColor,
    status: normalizeGameStatus(game.status),
    players: 0,
    modes: game.modes ?? [],
  };
}

function mapPlayer(player: ApiPlayer): Player {
  const name = player.display_name;
  return {
    id: player.id,
    name,
    initials: initials(name),
    ministry: ministryLabel(player.ministry_id),
    points: 0,
    matches: 0,
    level: 1,
    color: colorFor(player.id),
  };
}

function mapLiveRoom(room: ApiLiveRoom): LiveRoom {
  return {
    id: room.id,
    matchId: room.match_id,
    name: room.match_name,
    gameId: room.game_id,
    gameName: room.game_name,
    pin: room.pin,
    participants: room.participants,
    capacity: room.capacity ?? 0,
    host: room.host_name,
    startedMinutesAgo: room.started_minutes_ago,
  };
}

function mapRankingEntry(entry: ApiRankingEntry): RankingEntry {
  const name = entry.display_name === entry.player_id ? "Jogador" : entry.display_name;
  return {
    id: entry.player_id,
    name,
    initials: initials(name),
    ministry: ministryLabel(entry.ministry_id),
    points: entry.total_points,
    matches: entry.matches_played,
    level: levelFromPoints(entry.total_points),
    color: colorFor(entry.player_id),
    position: entry.position,
  };
}

function mapMatchState(state: ApiMatchState): MatchState {
  return {
    match: mapMatch(state.match_data),
    settings: {
      maxRounds: state.settings.max_rounds,
      timePerRoundSeconds: state.settings.time_per_round_seconds,
      initialPoints: state.settings.initial_points,
      remoteEnabled: state.settings.remote_enabled,
      capacity: state.settings.capacity,
    },
    questions: state.questions.map(mapQuestion),
    participants: state.participants.map(mapParticipant),
    currentRound: state.current_round ? mapRound(state.current_round) : null,
    room: state.room ? mapLiveRoom(state.room) : null,
    winner: state.winner ? mapParticipant(state.winner) : null,
  };
}

function mapQuestion(question: ApiMatchQuestion): MatchQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    expectedAnswer: question.expected_answer,
    points: question.points,
    used: question.used,
    position: question.position,
  };
}

function mapParticipant(participant: ApiMatchParticipant): MatchParticipant {
  return {
    id: participant.id,
    matchId: participant.match_id,
    playerId: participant.player_id,
    displayName: participant.display_name,
    joinSource: participant.join_source,
    currentScore: participant.current_score,
  };
}

function mapRound(round: ApiMatchRound): MatchRound {
  return {
    id: round.id,
    matchQuestionId: round.match_question_id,
    roundNumber: round.round_number,
    status: round.status,
    selectedParticipantId: round.selected_participant_id,
    answerRevealed: round.answer_revealed,
    question: round.question ? mapQuestion(round.question) : null,
  };
}

function mapMatch(match: ApiMatch): MatchSummary {
  return {
    id: match.id,
    name: match.name,
    status: normalizeMatchStatus(match.status),
    gameId: match.game_id,
    gameModeId: match.game_mode_id,
    currentRoundId: match.current_round_id,
    winnerParticipantId: match.winner_participant_id,
  };
}

function normalizeMatchStatus(status: string): MatchStatus {
  if (status === "in_progress") return "em-andamento";
  if (status === "finished" || status === "cancelled") return "encerrada";
  return "aguardando";
}

function normalizeGameStatus(status: string): GameStatus {
  if (status === "active" || status === "beta" || status === "maintenance") return status;
  if (status === "coming_soon" || status === "coming-soon") return "coming-soon";
  return "coming-soon";
}

function gameVisual(key: string): { icon: LucideIcon; iconColor: string } {
  if (key.includes("quote") || key.includes("versiculo")) {
    return { icon: Quote, iconColor: "text-amber-400 bg-amber-500/15" };
  }
  if (key.includes("check") || key.includes("verdadeiro")) {
    return { icon: CheckCircle2, iconColor: "text-emerald-400 bg-emerald-500/15" };
  }
  if (key.includes("book") || key.includes("quiz")) {
    return { icon: BookOpenText, iconColor: "text-indigo-400 bg-indigo-500/15" };
  }
  return { icon: Gamepad2, iconColor: "text-sky-400 bg-sky-500/15" };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ministryLabel(ministryId: string | null) {
  if (!ministryId) return "Sem ministerio";
  if (ministryId.endsWith("0004")) return "Jovens";
  if (ministryId.endsWith("0005")) return "EBD";
  return "Ministerio";
}

function levelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 1000) + 1);
}

function colorFor(seed: string) {
  const colors = [
    "bg-violet-500/20 text-violet-300",
    "bg-sky-500/20 text-sky-300",
    "bg-emerald-500/20 text-emerald-300",
    "bg-amber-500/20 text-amber-300",
    "bg-rose-500/20 text-rose-300",
  ];
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
