import { create } from "zustand";

export type GameMode = "classico" | "pontos-iniciais" | "eliminacao";
export type MatchStatus = "aguardando" | "em-andamento" | "encerrada";

export type Question = {
  id: string;
  text: string;
  answer: string;
  points: number;
  used: boolean;
};

export type MatchPlayer = {
  id: string;
  name: string;
  score: number;
  eliminatedThisRound: boolean;
  remote: boolean;
};

export type Match = {
  id: string;
  name: string;
  maxQuestions?: number;
  timePerQuestion?: number;
  mode: GameMode;
  initialPoints?: number;
  remoteEnabled: boolean;
  status: MatchStatus;
  questions: Question[];
  players: MatchPlayer[];
  currentQuestionId?: string;
  currentPlayerId?: string;
  answerRevealed: boolean;
  joinPin: string;
  createdAt: number;
};

export type CreateMatchInput = {
  name: string;
  mode: GameMode;
  maxQuestions?: number;
  timePerQuestion?: number;
  initialPoints?: number;
  remoteEnabled: boolean;
  questions?: Array<{ text: string; answer: string; points: number }>;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const pin = () => Math.floor(100000 + Math.random() * 900000).toString();

const modeLabels: Record<GameMode, string> = {
  classico: "Clássico",
  "pontos-iniciais": "Pontos iniciais",
  eliminacao: "Eliminação",
};
export const getModeLabel = (m: GameMode) => modeLabels[m];

const statusLabels: Record<MatchStatus, string> = {
  aguardando: "Aguardando",
  "em-andamento": "Em andamento",
  encerrada: "Encerrada",
};
export const getStatusLabel = (s: MatchStatus) => statusLabels[s];

type State = {
  matches: Record<string, Match>;
};

type Actions = {
  createMatch: (input: CreateMatchInput) => Match;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;

  addQuestion: (matchId: string, q: Omit<Question, "id" | "used">) => void;
  updateQuestion: (matchId: string, qId: string, patch: Partial<Question>) => void;
  removeQuestion: (matchId: string, qId: string) => void;
  importQuestions: (
    matchId: string,
    items: Array<{ text: string; answer: string; points: number }>,
  ) => number;

  addPlayer: (matchId: string, name: string, remote?: boolean) => MatchPlayer | null;
  removePlayer: (matchId: string, playerId: string) => void;
  applyPenalty: (matchId: string, playerId: string, delta: number) => void;

  startMatch: (matchId: string) => void;
  drawQuestion: (matchId: string) => Question | null;
  selectPlayer: (matchId: string, playerId: string) => void;
  buzzIn: (matchId: string, playerId: string, early?: boolean) => void;
  revealAnswer: (matchId: string) => void;
  registerAnswer: (matchId: string, correct: boolean) => void;
  endMatch: (matchId: string) => void;
  resetMatch: (matchId: string) => void;
  resetBuzzers: (matchId: string) => void;
};

function seed(): Record<string, Match> {
  const m1: Match = {
    id: "seed-aberta",
    name: "Quiz Bíblico — Jovens Betel",
    mode: "classico",
    maxQuestions: 10,
    timePerQuestion: 20,
    remoteEnabled: true,
    status: "aguardando",
    questions: [
      { id: uid(), text: "Quem construiu a arca?", answer: "Noé", points: 100, used: false },
      { id: uid(), text: "Em quantos dias Deus criou o mundo?", answer: "6", points: 100, used: false },
      { id: uid(), text: "Qual é o primeiro livro da Bíblia?", answer: "Gênesis", points: 100, used: false },
      { id: uid(), text: "Quem traiu Jesus?", answer: "Judas Iscariotes", points: 150, used: false },
      { id: uid(), text: "Quantos discípulos Jesus escolheu?", answer: "12", points: 100, used: false },
      { id: uid(), text: "Em que cidade Jesus nasceu?", answer: "Belém", points: 100, used: false },
    ],
    players: [
      { id: uid(), name: "Gabriel Santos", score: 0, eliminatedThisRound: false, remote: false },
      { id: uid(), name: "Sarah Oliveira", score: 0, eliminatedThisRound: false, remote: false },
    ],
    answerRevealed: false,
    joinPin: "482193",
    createdAt: Date.now() - 1000 * 60 * 60,
  };

  const m2: Match = {
    id: "seed-encerrada",
    name: "EBD Adultos — Verdadeiro ou Falso",
    mode: "pontos-iniciais",
    initialPoints: 500,
    remoteEnabled: false,
    status: "encerrada",
    questions: [
      { id: uid(), text: "Davi escreveu todos os Salmos?", answer: "Falso", points: 100, used: true },
      { id: uid(), text: "Moisés escreveu o Pentateuco?", answer: "Verdadeiro", points: 100, used: true },
      { id: uid(), text: "Paulo era originalmente chamado Saulo?", answer: "Verdadeiro", points: 100, used: true },
    ],
    players: [
      { id: uid(), name: "Tiago Mendes", score: 800, eliminatedThisRound: false, remote: false },
      { id: uid(), name: "Ana Clara", score: 700, eliminatedThisRound: false, remote: false },
      { id: uid(), name: "Marcos Lima", score: 600, eliminatedThisRound: false, remote: false },
      { id: uid(), name: "Beatriz Souza", score: 500, eliminatedThisRound: false, remote: false },
    ],
    answerRevealed: false,
    joinPin: "917235",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  };

  return { [m1.id]: m1, [m2.id]: m2 };
}

export const useMatchStore = create<State & Actions>((set, get) => ({
  matches: seed(),

  createMatch: (input) => {
    const id = uid();
    const initial = input.mode === "pontos-iniciais" ? input.initialPoints ?? 500 : 0;
    const match: Match = {
      id,
      name: input.name,
      mode: input.mode,
      maxQuestions: input.maxQuestions,
      timePerQuestion: input.timePerQuestion,
      initialPoints: input.initialPoints,
      remoteEnabled: input.remoteEnabled,
      status: "aguardando",
      questions: (input.questions ?? []).map((q) => ({ ...q, id: uid(), used: false })),
      players: [],
      answerRevealed: false,
      joinPin: pin(),
      createdAt: Date.now(),
    };
    if (input.mode === "pontos-iniciais") {
      // (no players yet, but kept for clarity)
      void initial;
    }
    set((s) => ({ matches: { ...s.matches, [id]: match } }));
    return match;
  },

  updateMatch: (id, patch) =>
    set((s) => {
      const m = s.matches[id];
      if (!m) return s;
      return { matches: { ...s.matches, [id]: { ...m, ...patch } } };
    }),

  deleteMatch: (id) =>
    set((s) => {
      const next = { ...s.matches };
      delete next[id];
      return { matches: next };
    }),

  addQuestion: (matchId, q) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      const question: Question = { ...q, id: uid(), used: false };
      return {
        matches: { ...s.matches, [matchId]: { ...m, questions: [...m.questions, question] } },
      };
    }),

  updateQuestion: (matchId, qId, patch) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: {
            ...m,
            questions: m.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)),
          },
        },
      };
    }),

  removeQuestion: (matchId, qId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: { ...m, questions: m.questions.filter((q) => q.id !== qId) },
        },
      };
    }),

  importQuestions: (matchId, items) => {
    const m = get().matches[matchId];
    if (!m) return 0;
    const added: Question[] = items.map((i) => ({ ...i, id: uid(), used: false }));
    set((s) => ({
      matches: {
        ...s.matches,
        [matchId]: { ...m, questions: [...m.questions, ...added] },
      },
    }));
    return added.length;
  },

  addPlayer: (matchId, name, remote = false) => {
    const m = get().matches[matchId];
    if (!m) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;
    if (m.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return null;
    const player: MatchPlayer = {
      id: uid(),
      name: trimmed,
      score: m.mode === "pontos-iniciais" ? m.initialPoints ?? 500 : 0,
      eliminatedThisRound: false,
      remote,
    };
    set((s) => ({
      matches: { ...s.matches, [matchId]: { ...m, players: [...m.players, player] } },
    }));
    return player;
  },

  removePlayer: (matchId, playerId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: { ...m, players: m.players.filter((p) => p.id !== playerId) },
        },
      };
    }),

  applyPenalty: (matchId, playerId, delta) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: {
            ...m,
            players: m.players.map((p) =>
              p.id === playerId ? { ...p, score: p.score + delta } : p,
            ),
          },
        },
      };
    }),

  startMatch: (matchId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: { ...s.matches, [matchId]: { ...m, status: "em-andamento" } },
      };
    }),

  drawQuestion: (matchId) => {
    const m = get().matches[matchId];
    if (!m) return null;
    const available = m.questions.filter((q) => !q.used);
    if (!available.length) return null;
    const usedCount = m.questions.length - available.length;
    if (m.maxQuestions && usedCount >= m.maxQuestions) return null;
    const pick = available[Math.floor(Math.random() * available.length)];
    set((s) => ({
      matches: {
        ...s.matches,
        [matchId]: {
          ...m,
          currentQuestionId: pick.id,
          currentPlayerId: undefined,
          answerRevealed: false,
          players: m.players.map((p) => ({ ...p, eliminatedThisRound: false })),
        },
      },
    }));
    return pick;
  },

  selectPlayer: (matchId, playerId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: { ...s.matches, [matchId]: { ...m, currentPlayerId: playerId } },
      };
    }),

  buzzIn: (matchId, playerId, early = false) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      if (early) {
        return {
          matches: {
            ...s.matches,
            [matchId]: {
              ...m,
              players: m.players.map((p) =>
                p.id === playerId ? { ...p, eliminatedThisRound: true } : p,
              ),
            },
          },
        };
      }
      if (m.currentPlayerId) return s;
      return {
        matches: { ...s.matches, [matchId]: { ...m, currentPlayerId: playerId } },
      };
    }),

  revealAnswer: (matchId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return { matches: { ...s.matches, [matchId]: { ...m, answerRevealed: true } } };
    }),

  registerAnswer: (matchId, correct) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m || !m.currentQuestionId) return s;
      const q = m.questions.find((qq) => qq.id === m.currentQuestionId);
      if (!q) return s;
      const players =
        correct && m.currentPlayerId
          ? m.players.map((p) =>
              p.id === m.currentPlayerId ? { ...p, score: p.score + q.points } : p,
            )
          : m.players;
      return {
        matches: {
          ...s.matches,
          [matchId]: {
            ...m,
            players,
            questions: m.questions.map((qq) => (qq.id === q.id ? { ...qq, used: true } : qq)),
            answerRevealed: true,
          },
        },
      };
    }),

  endMatch: (matchId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: { ...m, status: "encerrada", currentQuestionId: undefined, currentPlayerId: undefined },
        },
      };
    }),

  resetMatch: (matchId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: {
            ...m,
            status: "aguardando",
            currentQuestionId: undefined,
            currentPlayerId: undefined,
            answerRevealed: false,
            questions: m.questions.map((q) => ({ ...q, used: false })),
            players: m.players.map((p) => ({
              ...p,
              score: m.mode === "pontos-iniciais" ? m.initialPoints ?? 500 : 0,
              eliminatedThisRound: false,
            })),
          },
        },
      };
    }),

  resetBuzzers: (matchId) =>
    set((s) => {
      const m = s.matches[matchId];
      if (!m) return s;
      return {
        matches: {
          ...s.matches,
          [matchId]: {
            ...m,
            currentPlayerId: undefined,
            players: m.players.map((p) => ({ ...p, eliminatedThisRound: false })),
          },
        },
      };
    }),
}));

export function parseCsv(text: string): Array<{ text: string; answer: string; points: number }> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  // skip header if it looks like one
  const first = lines[0].toLowerCase();
  const start = first.includes("pergunta") || first.includes("question") ? 1 : 0;
  const out: Array<{ text: string; answer: string; points: number }> = [];
  for (let i = start; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;
    const text = cols[0]?.trim();
    const answer = cols[1]?.trim();
    const points = Number.parseInt(cols[2] ?? "100", 10) || 100;
    if (text && answer) out.push({ text, answer, points });
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}
