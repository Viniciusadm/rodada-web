import type { MatchQuestionDraft, MatchStatus } from "@/lib/match-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://games.isarchie.com.br/";

export type MatchMode = "buzzer" | "quiz";
export type QuestionType = "buzzer" | "true_false" | "free_text" | "multiple_choice";
export type McOption = { text: string; correct: boolean };

export type Player = {
  id: string;
  name: string;
  initials: string;
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
  mode: MatchMode;
  modeLabel: string;
  pin: string;
  participants: number;
  capacity: number;
  host: string;
  startedMinutesAgo: number;
};

export type ApiMatch = {
  id: string;
  mode: string;
  host_user_id: string;
  name: string;
  status: string;
  current_round_id: string | null;
  winner_participant_id: string | null;
  mode_label?: string;
  scoring_mode_label?: string;
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
  mode: MatchMode;
  currentRoundId: string | null;
  winnerParticipantId: string | null;
  modeLabel: string;
  scoringModeLabel: string;
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
  type: QuestionType;
  prompt: string;
  expectedAnswer: string;
  options: McOption[];
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
  earlyParticipantIds: string[];
};

export type MatchState = {
  match: MatchSummary;
  settings: {
    mode: MatchMode;
    scoringMode: string;
    maxRounds: number | null;
    timePerRoundSeconds: number | null;
    initialPoints: number;
    remoteEnabled: boolean;
    capacity: number | null;
    buzzerArmDelaySeconds: number;
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

type ApiPlayer = {
  id: string;
  display_name: string;
  is_active: boolean;
  total_points: number;
  matches_played: number;
  wins: number;
};

type ApiRankingEntry = {
  position: number;
  player_id: string;
  display_name: string;
  total_points: number;
  matches_played: number;
  wins: number;
};

type ApiMcOption = { text: string; correct: boolean };

type ApiMatchQuestion = {
  id: string;
  question_type: string;
  prompt: string;
  expected_answer: string;
  options: ApiMcOption[];
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
  early_participant_ids: string[];
};

type ApiLiveRoom = {
  id: string;
  match_id: string;
  match_name: string;
  mode: string;
  mode_label: string;
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
    scoring_mode: string;
    max_rounds: number | null;
    time_per_round_seconds: number | null;
    initial_points: number;
    remote_enabled: boolean;
    capacity: number | null;
    buzzer_arm_delay_seconds: number;
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

export type AuthSession = {
  user: AuthUser;
};

export type SearchResults = {
  games: Array<{ id: string; name: string; slug: string }>;
  players: Array<{ id: string; displayName: string }>;
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
};

type ApiSearchResponse = {
  games: Array<{ id: string; name: string; slug: string }>;
  players: Array<{ id: string; display_name: string; ministry_id: string | null }>;
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

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function listPlayers(): Promise<Player[]> {
  const players = await request<ApiPlayer[]>(`/api/v1/players`);
  return players.map((player) => mapPlayer(player));
}

export async function listRankings(): Promise<RankingEntry[]> {
  const ranking = await request<ApiRankingEntry[]>(`/api/v1/rankings`);
  return ranking.map((entry) => mapRankingEntry(entry));
}

export async function listMatches(): Promise<MatchSummary[]> {
  const matches = await request<ApiMatch[]>(`/api/v1/matches`);
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
  mode: MatchMode;
  scoringMode?: "classico" | "pontos-iniciais" | "eliminacao";
  maxQuestions?: number;
  timePerQuestion?: number;
  initialPoints?: number;
  remoteEnabled: boolean;
  buzzerArmDelaySeconds?: number;
  questions: MatchQuestionDraft[];
}): Promise<MatchSummary> {
  const scoringMap = {
    classico: "classic",
    "pontos-iniciais": "initial_points",
    eliminacao: "elimination",
  } as const;
  const scoringMode =
    input.mode === "buzzer" ? scoringMap[input.scoringMode ?? "classico"] : "classic";
  const created = await request<ApiMatch>("/api/v1/matches", {
    method: "POST",
    body: {
      mode: input.mode,
      scoring_mode: scoringMode,
      host_user_id: "resolved-from-token",
      name: input.name,
      max_rounds: input.maxQuestions,
      time_per_round_seconds: input.timePerQuestion,
      initial_points: input.initialPoints,
      remote_enabled: input.remoteEnabled,
      buzzer_arm_delay_seconds: input.buzzerArmDelaySeconds,
      questions: input.questions.map((question) => ({
        source_question_id: null,
        question_type: input.mode === "buzzer" ? "buzzer" : question.type,
        prompt: question.text,
        expected_answer: question.answer,
        options: question.options ?? [],
        points: question.points,
      })),
    },
  });
  return mapMatch(created);
}

export async function createPlayer(input: { displayName: string }): Promise<Player> {
  const result = await request<ApiPlayer>("/api/v1/players", {
    method: "POST",
    body: {
      user_id: null,
      display_name: input.displayName,
    },
  });
  return mapPlayer(result);
}

export async function updatePlayer(
  playerId: string,
  input: { displayName?: string; isActive?: boolean },
): Promise<Player> {
  const result = await request<ApiPlayer>(`/api/v1/players/${playerId}`, {
    method: "PATCH",
    body: {
      display_name: input.displayName,
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
  question: {
    questionType?: QuestionType;
    prompt: string;
    expectedAnswer: string;
    options?: McOption[];
    points: number;
  },
) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions`, {
    method: "POST",
    body: {
      question_type: question.questionType,
      prompt: question.prompt,
      expected_answer: question.expectedAnswer,
      options: question.options ?? [],
      points: question.points,
    },
  });
}

export async function updateMatchQuestion(
  matchId: string,
  questionId: string,
  question: {
    questionType?: QuestionType;
    prompt: string;
    expectedAnswer: string;
    options?: McOption[];
    points: number;
  },
) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions/${questionId}`, {
    method: "PATCH",
    body: {
      question_type: question.questionType,
      prompt: question.prompt,
      expected_answer: question.expectedAnswer,
      options: question.options ?? [],
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
  return request<{ accepted: boolean; correct: boolean | null; early: boolean }>(
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
  };
}

export async function searchOrganization(query: string): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });
  const results = await request<ApiSearchResponse>(`/api/v1/search?${params}`);
  return {
    games: results.games.map((game) => ({ id: game.id, name: game.name, slug: game.slug })),
    players: results.players.map((player) => ({
      id: player.id,
      displayName: player.display_name,
    })),
  };
}

export async function listNotifications(): Promise<AppNotification[]> {
  const notifications = await request<ApiNotification[]>(`/api/v1/notifications`);
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

export async function markNotificationRead(notificationId: string) {
  await requestNoContent(`/api/v1/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead() {
  await requestNoContent(`/api/v1/notifications/read-all`, { method: "POST" });
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

function mapPlayer(player: ApiPlayer): Player {
  const name = player.display_name;
  return {
    id: player.id,
    name,
    initials: initials(name),
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
    mode: normalizeMatchMode(room.mode),
    modeLabel: room.mode_label,
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
      mode: normalizeMatchMode(state.settings.mode),
      scoringMode: state.settings.scoring_mode,
      maxRounds: state.settings.max_rounds,
      timePerRoundSeconds: state.settings.time_per_round_seconds,
      initialPoints: state.settings.initial_points,
      remoteEnabled: state.settings.remote_enabled,
      capacity: state.settings.capacity,
      buzzerArmDelaySeconds: state.settings.buzzer_arm_delay_seconds,
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
    type: normalizeQuestionType(question.question_type),
    prompt: question.prompt,
    expectedAnswer: question.expected_answer,
    options: question.options ?? [],
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
    earlyParticipantIds: round.early_participant_ids ?? [],
  };
}

function mapMatch(match: ApiMatch): MatchSummary {
  return {
    id: match.id,
    name: match.name,
    status: normalizeMatchStatus(match.status),
    mode: normalizeMatchMode(match.mode),
    currentRoundId: match.current_round_id,
    winnerParticipantId: match.winner_participant_id,
    modeLabel: match.mode_label ?? "",
    scoringModeLabel: match.scoring_mode_label ?? "",
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

function normalizeMatchMode(mode: string): MatchMode {
  return mode === "quiz" ? "quiz" : "buzzer";
}

function normalizeQuestionType(type: string): QuestionType {
  if (type === "true_false" || type === "free_text" || type === "multiple_choice") {
    return type;
  }
  return "buzzer";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
