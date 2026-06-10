import type { GameMode, MatchQuestionDraft, MatchStatus } from "@/lib/match-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://games.isarchie.com.br/";

export type MatchMode = "buzzer" | "quiz";
export type QuestionType = "buzzer" | "true_false" | "free_text" | "multiple_choice";
export type McOption = { text: string; correct: boolean };

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
  sourceQuestionId: string | null;
  type: QuestionType;
  prompt: string;
  expectedAnswer: string;
  options: McOption[];
  points: number;
  used: boolean;
  position: number;
};

export type GeneralQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  expectedAnswer: string;
  options: McOption[];
  points: number;
  createdAt: string;
};

export type GeneralQuestionPage = {
  items: GeneralQuestion[];
  total: number;
  page: number;
  pageSize: number;
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

export type LastRoundResult = {
  roundNumber: number;
  participantId: string | null;
  displayName: string | null;
  result: "correct" | "incorrect" | "skipped";
  pointsApplied: number;
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
    rankingDisplay: "always" | "between_questions" | "end_only";
  };
  questions: MatchQuestion[];
  participants: MatchParticipant[];
  currentRound: MatchRound | null;
  room: LiveRoom | null;
  winner: MatchParticipant | null;
  lastRoundResult: LastRoundResult | null;
};

export type JoinMatchResult = {
  participant: MatchParticipant;
  participantToken: string;
};

export type ImportQuestionsResult = {
  created: number;
  invalidRows: Array<{ line: number; reason: string }>;
};

type ApiMcOption = { text: string; correct: boolean };

type ApiMatchQuestion = {
  id: string;
  source_question_id: string | null;
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

export type ApiMatchState = {
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
    ranking_display: string;
  };
  questions: ApiMatchQuestion[];
  participants: ApiMatchParticipant[];
  current_round: ApiMatchRound | null;
  room: ApiLiveRoom | null;
  winner: ApiMatchParticipant | null;
  last_round_result: ApiLastRoundResult | null;
};

type ApiLastRoundResult = {
  round_number: number;
  participant_id: string | null;
  display_name: string | null;
  result: "correct" | "incorrect" | "skipped";
  points_applied: number;
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
  templateId: string;
  name?: string;
}): Promise<MatchSummary> {
  const created = await request<ApiMatch>("/api/v1/matches", {
    method: "POST",
    body: {
      template_id: input.templateId,
      name: input.name?.trim() ? input.name.trim() : undefined,
    },
  });
  return mapMatch(created);
}

export type GameCatalogItem = {
  mode: MatchMode;
  name: string;
  description: string;
};

export const GAMES_CATALOG: GameCatalogItem[] = [
  {
    mode: "buzzer",
    name: "Buzzer",
    description:
      "Jogadores apertam para responder e você decide quem acertou. Ideal para disputas ao vivo.",
  },
  {
    mode: "quiz",
    name: "Quiz",
    description: "Perguntas com correção automática (verdadeiro/falso, múltipla escolha ou texto).",
  },
];

export type MatchTemplateQuestion = {
  id: string;
  sourceQuestionId: string | null;
  type: QuestionType;
  prompt: string;
  expectedAnswer: string;
  options: McOption[];
  points: number;
  position: number;
};

export type MatchTemplate = {
  id: string;
  name: string;
  description: string | null;
  mode: MatchMode;
  scoringMode: GameMode;
  modeLabel: string;
  scoringModeLabel: string;
  maxRounds: number | null;
  timePerRoundSeconds: number | null;
  initialPoints: number;
  remoteEnabled: boolean;
  capacity: number | null;
  buzzerArmDelaySeconds: number;
  rankingDisplay: "always" | "between_questions" | "end_only";
  questions: MatchTemplateQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type MatchTemplateSummary = {
  id: string;
  name: string;
  description: string | null;
  mode: MatchMode;
  scoringMode: string;
  modeLabel: string;
  scoringModeLabel: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MatchTemplateInput = {
  name: string;
  description?: string;
  mode: MatchMode;
  scoringMode?: GameMode;
  maxQuestions?: number;
  timePerQuestion?: number;
  initialPoints?: number;
  remoteEnabled: boolean;
  buzzerArmDelaySeconds?: number;
  rankingDisplay?: "always" | "between_questions" | "end_only";
  questions: MatchQuestionDraft[];
};

type ApiMatchTemplateQuestion = {
  id: string;
  source_question_id: string | null;
  question_type: string;
  prompt: string;
  expected_answer: string;
  options: ApiMcOption[];
  points: number;
  position: number;
};

type ApiMatchTemplate = {
  id: string;
  name: string;
  description: string | null;
  mode: string;
  scoring_mode: string;
  mode_label: string;
  scoring_mode_label: string;
  max_rounds: number | null;
  time_per_round_seconds: number | null;
  initial_points: number;
  remote_enabled: boolean;
  capacity: number | null;
  buzzer_arm_delay_seconds: number;
  ranking_display: string;
  questions: ApiMatchTemplateQuestion[];
  created_at: string;
  updated_at: string;
};

type ApiMatchTemplateSummary = {
  id: string;
  name: string;
  description: string | null;
  mode: string;
  scoring_mode: string;
  mode_label: string;
  scoring_mode_label: string;
  question_count: number;
  created_at: string;
  updated_at: string;
};

const SCORING_CODE_TO_MODE: Record<string, GameMode> = {
  classic: "classico",
  initial_points: "pontos-iniciais",
  elimination: "eliminacao",
};

const SCORING_MODE_TO_CODE: Record<GameMode, string> = {
  classico: "classic",
  "pontos-iniciais": "initial_points",
  eliminacao: "elimination",
};

function matchTemplateBody(input: MatchTemplateInput) {
  const scoringMode =
    input.mode === "buzzer" ? SCORING_MODE_TO_CODE[input.scoringMode ?? "classico"] : "classic";
  return {
    mode: input.mode,
    scoring_mode: scoringMode,
    name: input.name,
    description: input.description ?? null,
    max_rounds: input.maxQuestions,
    time_per_round_seconds: input.timePerQuestion,
    initial_points: input.initialPoints,
    remote_enabled: input.remoteEnabled,
    buzzer_arm_delay_seconds: input.buzzerArmDelaySeconds,
    ranking_display: input.rankingDisplay,
    questions: input.questions.map((question) => ({
      source_question_id: question.sourceQuestionId ?? null,
      question_type: input.mode === "buzzer" ? "buzzer" : question.type,
      prompt: question.text,
      expected_answer: question.answer,
      options: question.options ?? [],
      points: question.points,
    })),
  };
}

function mapMatchTemplate(template: ApiMatchTemplate): MatchTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    mode: normalizeMatchMode(template.mode),
    scoringMode: SCORING_CODE_TO_MODE[template.scoring_mode] ?? "classico",
    modeLabel: template.mode_label,
    scoringModeLabel: template.scoring_mode_label,
    maxRounds: template.max_rounds,
    timePerRoundSeconds: template.time_per_round_seconds,
    initialPoints: template.initial_points,
    remoteEnabled: template.remote_enabled,
    capacity: template.capacity,
    buzzerArmDelaySeconds: template.buzzer_arm_delay_seconds,
    rankingDisplay: template.ranking_display as "always" | "between_questions" | "end_only",
    questions: template.questions.map((question) => ({
      id: question.id,
      sourceQuestionId: question.source_question_id ?? null,
      type: normalizeQuestionType(question.question_type),
      prompt: question.prompt,
      expectedAnswer: question.expected_answer,
      options: question.options ?? [],
      points: question.points,
      position: question.position,
    })),
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  };
}

function mapMatchTemplateSummary(template: ApiMatchTemplateSummary): MatchTemplateSummary {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    mode: normalizeMatchMode(template.mode),
    scoringMode: template.scoring_mode,
    modeLabel: template.mode_label,
    scoringModeLabel: template.scoring_mode_label,
    questionCount: template.question_count,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  };
}

export async function listMatchTemplates(search?: string): Promise<MatchTemplateSummary[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const templates = await request<ApiMatchTemplateSummary[]>(`/api/v1/match-templates${query}`);
  return templates.map(mapMatchTemplateSummary);
}

export async function getMatchTemplate(id: string): Promise<MatchTemplate> {
  return mapMatchTemplate(await request<ApiMatchTemplate>(`/api/v1/match-templates/${id}`));
}

export async function createMatchTemplate(input: MatchTemplateInput): Promise<MatchTemplate> {
  const created = await request<ApiMatchTemplate>(`/api/v1/match-templates`, {
    method: "POST",
    body: matchTemplateBody(input),
  });
  return mapMatchTemplate(created);
}

export async function updateMatchTemplate(
  id: string,
  input: MatchTemplateInput,
): Promise<MatchTemplate> {
  const updated = await request<ApiMatchTemplate>(`/api/v1/match-templates/${id}`, {
    method: "PATCH",
    body: matchTemplateBody(input),
  });
  return mapMatchTemplate(updated);
}

export async function duplicateMatchTemplate(id: string): Promise<MatchTemplate> {
  const duplicated = await request<ApiMatchTemplate>(`/api/v1/match-templates/${id}/duplicate`, {
    method: "POST",
  });
  return mapMatchTemplate(duplicated);
}

export async function deleteMatchTemplate(id: string) {
  await requestNoContent(`/api/v1/match-templates/${id}`, { method: "DELETE" });
}

export async function addParticipant(matchId: string, displayName: string) {
  await requestNoContent(`/api/v1/matches/${matchId}/participants`, {
    method: "POST",
    body: {
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
    sourceQuestionId?: string | null;
  },
) {
  await requestNoContent(`/api/v1/matches/${matchId}/questions`, {
    method: "POST",
    body: {
      source_question_id: question.sourceQuestionId ?? null,
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

type ApiGeneralQuestion = {
  id: string;
  question_type: string;
  prompt: string;
  expected_answer: string;
  options: ApiMcOption[];
  default_points: number;
  created_at: string;
  updated_at: string;
};

type ApiGeneralQuestionList = {
  items: ApiGeneralQuestion[];
  total: number;
  page: number;
  page_size: number;
};

function mapGeneralQuestion(question: ApiGeneralQuestion): GeneralQuestion {
  return {
    id: question.id,
    type: normalizeQuestionType(question.question_type),
    prompt: question.prompt,
    expectedAnswer: question.expected_answer,
    options: question.options ?? [],
    points: question.default_points,
    createdAt: question.created_at,
  };
}

export async function listGeneralQuestions(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<GeneralQuestionPage> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("page_size", String(params.pageSize));
  const suffix = query.toString();
  const result = await request<ApiGeneralQuestionList>(
    `/api/v1/general-questions${suffix ? `?${suffix}` : ""}`,
  );
  return {
    items: result.items.map(mapGeneralQuestion),
    total: result.total,
    page: result.page,
    pageSize: result.page_size,
  };
}

type GeneralQuestionInput = {
  questionType: QuestionType;
  prompt: string;
  expectedAnswer: string;
  options?: McOption[];
  points: number;
};

function generalQuestionBody(input: GeneralQuestionInput) {
  return {
    question_type: input.questionType,
    prompt: input.prompt,
    expected_answer: input.expectedAnswer,
    options: input.options ?? [],
    default_points: input.points,
  };
}

export async function createGeneralQuestion(input: GeneralQuestionInput): Promise<GeneralQuestion> {
  const created = await request<ApiGeneralQuestion>(`/api/v1/general-questions`, {
    method: "POST",
    body: generalQuestionBody(input),
  });
  return mapGeneralQuestion(created);
}

export async function updateGeneralQuestion(
  id: string,
  input: GeneralQuestionInput,
): Promise<GeneralQuestion> {
  const updated = await request<ApiGeneralQuestion>(`/api/v1/general-questions/${id}`, {
    method: "PATCH",
    body: generalQuestionBody(input),
  });
  return mapGeneralQuestion(updated);
}

export async function deleteGeneralQuestion(id: string) {
  await requestNoContent(`/api/v1/general-questions/${id}`, { method: "DELETE" });
}

export async function importGeneralQuestions(csv: string): Promise<ImportQuestionsResult> {
  const result = await request<{
    created: number;
    invalid_rows: Array<{ line: number; reason: string }>;
  }>(`/api/v1/general-questions/import-csv`, {
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

export async function resumeByPin(pin: string, participantToken: string): Promise<JoinMatchResult> {
  const result = await request<ApiJoinMatchResult>(`/api/v1/rooms/resume`, {
    auth: false,
    method: "POST",
    body: { pin, participant_token: participantToken },
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

export function mapMatchState(state: ApiMatchState): MatchState {
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
      rankingDisplay: state.settings.ranking_display as "always" | "between_questions" | "end_only",
    },
    questions: state.questions.map(mapQuestion),
    participants: state.participants.map(mapParticipant),
    currentRound: state.current_round ? mapRound(state.current_round) : null,
    room: state.room ? mapLiveRoom(state.room) : null,
    winner: state.winner ? mapParticipant(state.winner) : null,
    lastRoundResult: state.last_round_result
      ? {
          roundNumber: state.last_round_result.round_number,
          participantId: state.last_round_result.participant_id,
          displayName: state.last_round_result.display_name,
          result: state.last_round_result.result,
          pointsApplied: state.last_round_result.points_applied,
        }
      : null,
  };
}

function mapQuestion(question: ApiMatchQuestion): MatchQuestion {
  return {
    id: question.id,
    sourceQuestionId: question.source_question_id ?? null,
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
