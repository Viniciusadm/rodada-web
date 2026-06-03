import { CheckCircle2, Gamepad2, Joystick, Pencil, Puzzle, type LucideIcon } from "lucide-react";
import type { MatchQuestionDraft, MatchStatus } from "@/lib/match-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://games.isarchie.com.br/";
export const DEMO_ORGANIZATION_ID =
  import.meta.env.VITE_DEMO_ORGANIZATION_ID ?? "10000000-0000-0000-0000-000000000001";

export type GameKind = "buzzer" | "true_false" | "free_text";

export type Game = {
  id: string;
  organizationId: string | null;
  slug: string;
  name: string;
  description: string;
  kind: GameKind;
  icon: LucideIcon;
  iconColor: string;
  players: number;
  modes: GameModeOption[];
};

export type GameModeOption = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  defaultInitialPoints: number | null;
  defaultTimePerQuestionSeconds: number | null;
  isActive: boolean;
};

export type Player = {
  id: string;
  name: string;
  ministryId: string | null;
  initials: string;
  team: string;
  points: number;
  matches: number;
  level: number;
  color: string;
  isActive: boolean;
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
  game_name?: string;
  mode_name?: string;
  question_count?: number;
  participant_count?: number;
  rounds_played?: number;
  current_round_number?: number | null;
  current_round_status?: "open" | "answer_revealed" | "closed" | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  winner_name?: string | null;
  winner_score?: number | null;
  top_scores?: Array<{ participant_id: string; display_name: string; score: number }>;
};

export type MatchSummary = {
  id: string;
  name: string;
  status: MatchStatus;
  gameId: string;
  gameModeId: string;
  currentRoundId: string | null;
  winnerParticipantId: string | null;
  gameName: string;
  modeName: string;
  questionCount: number;
  participantCount: number;
  roundsPlayed: number;
  currentRoundNumber: number | null;
  currentRoundStatus: "open" | "answer_revealed" | "closed" | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  winnerName: string | null;
  winnerScore: number | null;
  topScores: Array<{ participantId: string; displayName: string; score: number }>;
};

export type MatchQuestion = {
  id: string;
  prompt: string;
  expectedAnswer: string;
  points: number;
  used: boolean;
  position: number;
};

export type MatchRoundAnswer = {
  participantId: string | null;
  displayName: string | null;
  result: "correct" | "incorrect" | "skipped";
  pointsApplied: number;
};

export type MatchRoundDetail = {
  roundNumber: number;
  status: string;
  prompt: string | null;
  expectedAnswer: string | null;
  answers: MatchRoundAnswer[];
};

type ApiMatchRoundDetail = {
  round_number: number;
  status: string;
  prompt: string | null;
  expected_answer: string | null;
  answers: Array<{
    participant_id: string | null;
    display_name: string | null;
    result: "correct" | "incorrect" | "skipped";
    points_applied: number;
  }>;
};

export type MatchParticipant = {
  id: string;
  matchId: string;
  playerId: string | null;
  displayName: string;
  joinSource: "local" | "remote";
  currentScore: number;
  livesRemaining: number | null;
  eliminated: boolean;
};

export type MatchRound = {
  id: string;
  matchQuestionId: string | null;
  roundNumber: number;
  status: "open" | "answer_revealed" | "closed";
  selectedParticipantId: string | null;
  answerRevealed: boolean;
  timeRemainingSeconds: number | null;
  question: MatchQuestion | null;
};

export type MatchState = {
  match: MatchSummary;
  settings: {
    mode: string;
    gameKind: GameKind;
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

type ApiGameMode = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  default_initial_points: number | null;
  default_time_per_question_seconds: number | null;
  is_active: boolean;
};

type ApiGame = {
  id: string;
  organization_id: string | null;
  slug: string;
  name: string;
  description: string;
  kind: string;
  icon_key: string | null;
  player_count: number;
  modes: ApiGameMode[];
};

type ApiPlayer = {
  id: string;
  display_name: string;
  ministry_id: string | null;
  is_active: boolean;
  total_points: number;
  matches_played: number;
  wins: number;
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
  lives_remaining: number | null;
  eliminated: boolean;
};

type ApiMatchRound = {
  id: string;
  match_question_id: string | null;
  round_number: number;
  status: "open" | "answer_revealed" | "closed";
  selected_participant_id: string | null;
  answer_revealed: boolean;
  time_remaining_seconds: number | null;
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
    mode: string;
    game_kind: string;
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

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
};

export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export type AuthSession = {
  user: AuthUser;
  organizations: AuthOrganization[];
  activeOrganizationId: string | null;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type SearchResults = {
  games: Array<{ id: string; name: string; slug: string }>;
  players: Array<{ id: string; displayName: string }>;
  rooms: Array<{ matchId: string; name: string; pin: string }>;
};

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationPreference = {
  key: string;
  enabled: boolean;
};

type ApiMeResponse = {
  user: { id: string; display_name: string; email: string };
  organizations: Array<{ id: string; name: string; slug: string; role: string }>;
  active_organization_id: string | null;
};

type ApiTeam = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type ApiSearchResponse = {
  games: Array<{ id: string; name: string; slug: string }>;
  players: Array<{ id: string; display_name: string; ministry_id: string | null }>;
  rooms: Array<{ match_id: string; name: string; pin: string }>;
};

type ApiNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

let accessToken: string | null = null;
let activeOrganizationId: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

/**
 * Erro de requisição que carrega o status HTTP e o `code` curto do backend
 * (ex.: "conflict", "forbidden", "not_found"), permitindo que a UI distinga
 * permissão, conflito e falha de rede em vez de mostrar sempre um texto genérico.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** Sem status: tipicamente uma falha de rede (fetch rejeitado). */
  get isNetwork() {
    return this.status === 0;
  }
}

/** Cópia amigável (pt-BR) por código de erro do backend, para as ações de partida. */
const MATCH_ERROR_COPY: Record<string, string> = {
  match_round_open:
    "Já há uma pergunta em andamento. Encerre a rodada atual antes de sortear a próxima.",
  match_not_started: "Inicie a partida antes de sortear perguntas.",
  match_finished: "Esta partida já foi encerrada.",
  match_already_finished: "Esta partida já foi encerrada.",
  match_no_questions: "Esta partida ainda não tem perguntas. Adicione perguntas para começar.",
  match_all_questions_used:
    "Todas as perguntas já foram usadas. Adicione novas perguntas ou encerre a partida.",
  match_round_limit: "O limite de perguntas da partida foi atingido.",
  match_no_participants: "Adicione ao menos um participante antes de iniciar.",
  match_already_started: "A partida já foi iniciada.",
  match_no_open_round: "Não há uma pergunta aberta para revelar.",
  match_not_host: "Apenas o anfitrião pode controlar esta partida.",
  match_not_found: "Partida não encontrada.",
};

/** Converte qualquer erro em uma mensagem amigável e diferenciada para o usuário. */
export function errorToMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetwork) return "Sem conexão. Verifique sua internet e tente novamente.";
    if (error.code && MATCH_ERROR_COPY[error.code]) return MATCH_ERROR_COPY[error.code];
    if (error.status === 403) return "Você não tem permissão para essa ação.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Algo deu errado. Tente novamente.";
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setActiveOrganizationId(id: string | null) {
  activeOrganizationId = id;
}

export function getActiveOrganizationId(): string {
  return activeOrganizationId ?? DEMO_ORGANIZATION_ID;
}

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function listGames(): Promise<Game[]> {
  const games = await request<ApiGame[]>("/api/v1/games", { auth: false });
  return games.map(mapGame);
}

export async function listGamesForAdmin(
  organizationId = getActiveOrganizationId(),
): Promise<Game[]> {
  const games = await request<ApiGame[]>(`/api/v1/organizations/${organizationId}/games`);
  return games.map(mapGame);
}

export async function listPlayers(
  organizationId = getActiveOrganizationId(),
  teams?: Map<string, string>,
): Promise<Player[]> {
  const players = await request<ApiPlayer[]>(`/api/v1/organizations/${organizationId}/players`);
  return players.map((player) => mapPlayer(player, teams));
}

export async function listRankings(
  organizationId = getActiveOrganizationId(),
  teams?: Map<string, string>,
): Promise<RankingEntry[]> {
  const params = new URLSearchParams({ organization_id: organizationId });
  const ranking = await request<ApiRankingEntry[]>(`/api/v1/rankings?${params}`);
  return ranking.map((entry) => mapRankingEntry(entry, teams));
}

export async function listLiveRooms(
  organizationId = getActiveOrganizationId(),
): Promise<LiveRoom[]> {
  const rooms = await request<ApiLiveRoom[]>(`/api/v1/organizations/${organizationId}/rooms/live`);
  return rooms.map(mapLiveRoom);
}

export async function listMatches(
  organizationId = getActiveOrganizationId(),
): Promise<MatchSummary[]> {
  const matches = await request<ApiMatch[]>(`/api/v1/organizations/${organizationId}/matches`);
  return matches.map(mapMatch);
}

export async function listMatchRounds(matchId: string): Promise<MatchRoundDetail[]> {
  const rounds = await request<ApiMatchRoundDetail[]>(`/api/v1/matches/${matchId}/rounds`, {
    auth: false,
  });
  return rounds.map((round) => ({
    roundNumber: round.round_number,
    status: round.status,
    prompt: round.prompt,
    expectedAnswer: round.expected_answer,
    answers: round.answers.map((answer) => ({
      participantId: answer.participant_id,
      displayName: answer.display_name,
      result: answer.result,
      pointsApplied: answer.points_applied,
    })),
  }));
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
    throw new Error("Nenhum jogo disponível para criar a partida.");
  }
  const selectedGame = games.find((game) => game.id === gameId) ?? games[0];
  const modeCode =
    input.mode === "pontos-iniciais"
      ? "initial_points"
      : input.mode === "eliminacao"
        ? "elimination"
        : "classic";

  const gameModeId =
    input.gameModeId ?? selectedGame?.modes.find((mode) => mode.code === modeCode)?.id;
  if (!gameModeId) {
    throw new Error(
      `O jogo "${selectedGame?.name ?? "selecionado"}" não oferece o modo escolhido. Escolha outro modo.`,
    );
  }
  const created = await request<ApiMatch>("/api/v1/matches", {
    method: "POST",
    body: {
      organization_id: getActiveOrganizationId(),
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

export async function createPlayer(input: {
  displayName: string;
  ministryId: string | null;
  organizationId?: string;
}): Promise<Player> {
  const result = await request<ApiPlayer>("/api/v1/players", {
    method: "POST",
    body: {
      organization_id: input.organizationId ?? getActiveOrganizationId(),
      user_id: null,
      ministry_id: input.ministryId,
      display_name: input.displayName,
    },
  });
  return mapPlayer(result);
}

export async function updatePlayer(
  playerId: string,
  input: { displayName?: string; ministryId?: string | null; isActive?: boolean },
): Promise<Player> {
  const result = await request<ApiPlayer>(`/api/v1/players/${playerId}`, {
    method: "PATCH",
    body: {
      display_name: input.displayName,
      ministry_id: input.ministryId,
      is_active: input.isActive,
    },
  });
  return mapPlayer(result);
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

export async function joinByPin(pin: string, participantName: string): Promise<JoinMatchResult> {
  const result = await request<ApiJoinMatchResult>(`/api/v1/rooms/join`, {
    auth: false,
    method: "POST",
    body: { pin, participant_name: participantName },
  });
  return {
    participant: mapParticipant(result.participant),
    participantToken: result.participant_token,
  };
}

export async function sendPlayerAnswer(
  matchId: string,
  roundId: string,
  participantToken: string,
  answer?: string,
) {
  return request<{ accepted: boolean; correct: boolean | null }>(
    `/api/v1/matches/${matchId}/rounds/${roundId}/player-answer`,
    {
      auth: false,
      method: "POST",
      body: { participant_token: participantToken, answer: answer ?? null },
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
  if (options.auth !== false && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, API_BASE_URL), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Sem conexão. Verifique sua internet e tente novamente.", 0, null);
  }
  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) {
      unauthorizedHandler?.();
    }
    const { message, code } = await errorBody(response);
    throw new ApiError(message, response.status, code);
  }

  return response;
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/login", {
    auth: false,
    method: "POST",
    body: { email, password },
  });
}

export async function registerRequest(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return request<LoginResponse>("/api/v1/auth/register", {
    auth: false,
    method: "POST",
    body: {
      display_name: input.displayName,
      email: input.email,
      password: input.password,
    },
  });
}

export async function fetchMe(): Promise<AuthSession> {
  const payload = await request<ApiMeResponse>("/api/v1/auth/me");
  return {
    user: {
      id: payload.user.id,
      displayName: payload.user.display_name,
      email: payload.user.email,
    },
    organizations: payload.organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      role: org.role,
    })),
    activeOrganizationId: payload.active_organization_id,
  };
}

export async function listTeams(organizationId = getActiveOrganizationId()): Promise<Team[]> {
  const teams = await request<ApiTeam[]>(`/api/v1/organizations/${organizationId}/ministries`);
  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    isActive: team.is_active,
  }));
}

export async function createTeam(
  name: string,
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await request<{ id: string }>(`/api/v1/organizations/${organizationId}/ministries`, {
    method: "POST",
    body: { name },
  });
}

export async function updateTeam(
  teamId: string,
  input: { name?: string; isActive?: boolean },
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}/ministries/${teamId}`, {
    method: "PATCH",
    body: { name: input.name, is_active: input.isActive },
  });
}

export async function archiveTeam(
  teamId: string,
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}/ministries/${teamId}`, {
    method: "DELETE",
  });
}

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
};

export async function getOrganization(
  organizationId = getActiveOrganizationId(),
): Promise<OrganizationDetail> {
  const org = await request<{
    id: string;
    name: string;
    slug: string;
    contact_email: string | null;
  }>(`/api/v1/organizations/${organizationId}`);
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    contactEmail: org.contact_email,
  };
}

export async function updateOrganization(
  input: { name: string; contactEmail: string | null },
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}`, {
    method: "PATCH",
    body: { name: input.name, contact_email: input.contactEmail },
  });
}

export type OrgMember = {
  userId: string;
  displayName: string;
  email: string;
  role: string;
};

export async function listMembers(
  organizationId = getActiveOrganizationId(),
): Promise<OrgMember[]> {
  const members = await request<
    Array<{ user_id: string; display_name: string; email: string; role: string }>
  >(`/api/v1/organizations/${organizationId}/members`);
  return members.map((member) => ({
    userId: member.user_id,
    displayName: member.display_name,
    email: member.email,
    role: member.role,
  }));
}

export async function addMember(
  input: { email: string; role: string },
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}/members`, {
    method: "POST",
    body: { email: input.email, role: input.role },
  });
}

export async function updateMemberRole(
  userId: string,
  role: string,
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}/members/${userId}`, {
    method: "PATCH",
    body: { role },
  });
}

export async function removeMember(
  userId: string,
  organizationId = getActiveOrganizationId(),
): Promise<void> {
  await requestNoContent(`/api/v1/organizations/${organizationId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function searchOrganization(
  query: string,
  organizationId = getActiveOrganizationId(),
): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });
  const results = await request<ApiSearchResponse>(
    `/api/v1/organizations/${organizationId}/search?${params}`,
  );
  return {
    games: results.games.map((game) => ({ id: game.id, name: game.name, slug: game.slug })),
    players: results.players.map((player) => ({
      id: player.id,
      displayName: player.display_name,
    })),
    rooms: results.rooms.map((room) => ({
      matchId: room.match_id,
      name: room.name,
      pin: room.pin,
    })),
  };
}

export async function listNotifications(
  organizationId = getActiveOrganizationId(),
): Promise<AppNotification[]> {
  const params = new URLSearchParams({ organization_id: organizationId });
  const notifications = await request<ApiNotification[]>(`/api/v1/notifications?${params}`);
  return notifications.map((notification) => ({
    id: notification.id,
    kind: notification.kind,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    read: notification.read,
    createdAt: notification.created_at,
  }));
}

export async function markNotificationRead(
  notificationId: string,
  organizationId = getActiveOrganizationId(),
) {
  const params = new URLSearchParams({ organization_id: organizationId });
  await requestNoContent(`/api/v1/notifications/${notificationId}/read?${params}`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(organizationId = getActiveOrganizationId()) {
  const params = new URLSearchParams({ organization_id: organizationId });
  await requestNoContent(`/api/v1/notifications/read-all?${params}`, { method: "POST" });
}

export async function getNotificationPreferences(
  organizationId = getActiveOrganizationId(),
): Promise<NotificationPreference[]> {
  const params = new URLSearchParams({ organization_id: organizationId });
  return request<NotificationPreference[]>(`/api/v1/notification-preferences?${params}`);
}

export async function setNotificationPreference(
  key: string,
  enabled: boolean,
  organizationId = getActiveOrganizationId(),
): Promise<NotificationPreference> {
  return request<NotificationPreference>(`/api/v1/notification-preferences/${key}`, {
    method: "PUT",
    body: { organization_id: organizationId, enabled },
  });
}

async function errorBody(response: Response): Promise<{ message: string; code: string | null }> {
  try {
    const payload = (await response.json()) as { message?: string; code?: string };
    return {
      message: payload.message ?? `Falha na requisição (${response.status})`,
      code: payload.code ?? null,
    };
  } catch {
    return { message: `Falha na requisição (${response.status})`, code: null };
  }
}

function mapGame(game: ApiGame): Game {
  const visual = gameVisual(game.icon_key ?? game.slug);
  return {
    id: game.id,
    organizationId: game.organization_id ?? null,
    slug: game.slug,
    name: game.name,
    description: game.description,
    kind: normalizeGameKind(game.kind),
    icon: visual.icon,
    iconColor: visual.iconColor,
    players: game.player_count ?? 0,
    modes: (game.modes ?? []).map((mode) => ({
      id: mode.id,
      code: mode.code,
      name: mode.name,
      description: mode.description ?? null,
      defaultInitialPoints: mode.default_initial_points ?? null,
      defaultTimePerQuestionSeconds: mode.default_time_per_question_seconds ?? null,
      isActive: mode.is_active ?? true,
    })),
  };
}

function mapPlayer(player: ApiPlayer, teams?: Map<string, string>): Player {
  const name = player.display_name;
  return {
    id: player.id,
    name,
    ministryId: player.ministry_id,
    initials: initials(name),
    team: teamLabel(player.ministry_id, teams),
    points: player.total_points,
    matches: player.matches_played,
    level: levelFromPoints(player.total_points),
    color: colorFor(player.id),
    isActive: player.is_active,
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

function mapRankingEntry(entry: ApiRankingEntry, teams?: Map<string, string>): RankingEntry {
  const name = entry.display_name === entry.player_id ? "Jogador" : entry.display_name;
  return {
    id: entry.player_id,
    name,
    ministryId: entry.ministry_id,
    initials: initials(name),
    team: teamLabel(entry.ministry_id, teams),
    points: entry.total_points,
    matches: entry.matches_played,
    level: levelFromPoints(entry.total_points),
    color: colorFor(entry.player_id),
    isActive: true,
    position: entry.position,
  };
}

function mapMatchState(state: ApiMatchState): MatchState {
  return {
    match: mapMatch(state.match_data),
    settings: {
      mode: state.settings.mode,
      gameKind: normalizeGameKind(state.settings.game_kind),
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
    livesRemaining: participant.lives_remaining,
    eliminated: participant.eliminated,
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
    timeRemainingSeconds: round.time_remaining_seconds,
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
    gameName: match.game_name ?? "",
    modeName: match.mode_name ?? "",
    questionCount: match.question_count ?? 0,
    participantCount: match.participant_count ?? 0,
    roundsPlayed: match.rounds_played ?? 0,
    currentRoundNumber: match.current_round_number ?? null,
    currentRoundStatus: match.current_round_status ?? null,
    startedAt: match.started_at ?? null,
    endedAt: match.ended_at ?? null,
    durationSeconds: match.duration_seconds ?? null,
    winnerName: match.winner_name ?? null,
    winnerScore: match.winner_score ?? null,
    topScores:
      match.top_scores?.map((score) => ({
        participantId: score.participant_id,
        displayName: score.display_name,
        score: score.score,
      })) ?? [],
  };
}

function normalizeMatchStatus(status: string): MatchStatus {
  if (status === "in_progress") return "em-andamento";
  if (status === "finished" || status === "cancelled") return "encerrada";
  return "aguardando";
}

function normalizeGameKind(kind: string): GameKind {
  if (kind === "true_false" || kind === "free_text") return kind;
  return "buzzer";
}

function gameVisual(key: string): { icon: LucideIcon; iconColor: string } {
  if (key.includes("pencil") || key.includes("escrev") || key.includes("resposta")) {
    return { icon: Pencil, iconColor: "text-amber-400 bg-amber-500/15" };
  }
  if (key.includes("word") || key.includes("palavra")) {
    return { icon: Puzzle, iconColor: "text-amber-400 bg-amber-500/15" };
  }
  if (key.includes("check") || key.includes("verdadeiro")) {
    return { icon: CheckCircle2, iconColor: "text-emerald-400 bg-emerald-500/15" };
  }
  if (key.includes("book") || key.includes("quiz")) {
    return { icon: Joystick, iconColor: "text-indigo-400 bg-indigo-500/15" };
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

function teamLabel(teamId: string | null, teams?: Map<string, string>) {
  if (!teamId) return "Sem time";
  return teams?.get(teamId) ?? "Time";
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
