import {
  BookOpenText,
  ScrollText,
  UserSearch,
  Music2,
  CheckCircle2,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export type GameStatus = "active" | "beta" | "maintenance" | "coming-soon";

export type Game = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  status: GameStatus;
  players: number;
};

export const games: Game[] = [
  {
    id: "quiz-biblico",
    name: "Quiz Bíblico",
    description: "Desafie seus conhecimentos sobre o Antigo e Novo Testamento.",
    icon: BookOpenText,
    iconColor: "text-indigo-400 bg-indigo-500/15",
    status: "active",
    players: 128,
  },
  {
    id: "versiculo-completo",
    name: "Versículo Completo",
    description: "Complete as palavras que faltam em passagens icônicas.",
    icon: ScrollText,
    iconColor: "text-amber-400 bg-amber-500/15",
    status: "beta",
    players: 45,
  },
  {
    id: "quem-personagem",
    name: "Quem é o Personagem?",
    description: "Adivinhe a figura bíblica com poucas dicas.",
    icon: UserSearch,
    iconColor: "text-rose-400 bg-rose-500/15",
    status: "active",
    players: 92,
  },
  {
    id: "adivinhe-louvor",
    name: "Adivinhe o Louvor",
    description: "Reconheça hinos e louvores contemporâneos.",
    icon: Music2,
    iconColor: "text-sky-400 bg-sky-500/15",
    status: "maintenance",
    players: 0,
  },
  {
    id: "verdadeiro-falso",
    name: "Verdadeiro ou Falso",
    description: "Mitos e verdades sobre a história bíblica.",
    icon: CheckCircle2,
    iconColor: "text-emerald-400 bg-emerald-500/15",
    status: "active",
    players: 210,
  },
  {
    id: "corrida-perguntas",
    name: "Corrida de Perguntas",
    description: "Responda mais rápido que seus amigos e vença.",
    icon: Rocket,
    iconColor: "text-fuchsia-400 bg-fuchsia-500/15",
    status: "active",
    players: 167,
  },
];

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

export const players: Player[] = [
  { id: "1", name: "Gabriel Santos", initials: "GS", ministry: "Jovens", points: 14250, matches: 87, level: 12, color: "bg-violet-500/20 text-violet-300" },
  { id: "2", name: "Sarah Oliveira", initials: "SO", ministry: "Louvor", points: 12100, matches: 71, level: 11, color: "bg-pink-500/20 text-pink-300" },
  { id: "3", name: "Tiago Mendes", initials: "TM", ministry: "EBD", points: 10980, matches: 65, level: 10, color: "bg-sky-500/20 text-sky-300" },
  { id: "4", name: "Ana Clara", initials: "AC", ministry: "Kids", points: 9880, matches: 60, level: 9, color: "bg-amber-500/20 text-amber-300" },
  { id: "5", name: "Marcos Lima", initials: "ML", ministry: "Jovens", points: 8720, matches: 54, level: 9, color: "bg-emerald-500/20 text-emerald-300" },
  { id: "6", name: "Beatriz Souza", initials: "BS", ministry: "Diaconia", points: 7640, matches: 48, level: 8, color: "bg-rose-500/20 text-rose-300" },
  { id: "7", name: "João Pedro", initials: "JP", ministry: "Adolescentes", points: 6890, matches: 44, level: 7, color: "bg-indigo-500/20 text-indigo-300" },
  { id: "8", name: "Letícia Rocha", initials: "LR", ministry: "Louvor", points: 6320, matches: 41, level: 7, color: "bg-fuchsia-500/20 text-fuchsia-300" },
  { id: "9", name: "Daniel Alves", initials: "DA", ministry: "Mídia", points: 5780, matches: 38, level: 6, color: "bg-teal-500/20 text-teal-300" },
  { id: "10", name: "Camila Dias", initials: "CD", ministry: "Jovens", points: 5210, matches: 35, level: 6, color: "bg-cyan-500/20 text-cyan-300" },
  { id: "11", name: "Rafael Costa", initials: "RC", ministry: "EBD", points: 4690, matches: 31, level: 5, color: "bg-lime-500/20 text-lime-300" },
  { id: "12", name: "Mariana Reis", initials: "MR", ministry: "Kids", points: 4120, matches: 28, level: 5, color: "bg-orange-500/20 text-orange-300" },
];

export type Room = {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  pin: string;
  participants: number;
  capacity: number;
  host: string;
  startedMinutesAgo: number;
};

export const rooms: Room[] = [
  { id: "r1", name: "Jovens Betel — Sábado", gameId: "quiz-biblico", gameName: "Quiz Bíblico", pin: "482193", participants: 18, capacity: 40, host: "Gabriel Santos", startedMinutesAgo: 4 },
  { id: "r2", name: "Classe Timóteo — EBD", gameId: "versiculo-completo", gameName: "Versículo Completo", pin: "917235", participants: 12, capacity: 20, host: "Tiago Mendes", startedMinutesAgo: 12 },
  { id: "r3", name: "Kids Domingo Manhã", gameId: "quem-personagem", gameName: "Quem é o Personagem?", pin: "302841", participants: 24, capacity: 30, host: "Ana Clara", startedMinutesAgo: 7 },
  { id: "r4", name: "Célula Família Lima", gameId: "verdadeiro-falso", gameName: "Verdadeiro ou Falso", pin: "654219", participants: 9, capacity: 15, host: "Marcos Lima", startedMinutesAgo: 22 },
  { id: "r5", name: "Encontro de Casais", gameId: "corrida-perguntas", gameName: "Corrida de Perguntas", pin: "118734", participants: 16, capacity: 24, host: "Beatriz Souza", startedMinutesAgo: 2 },
];

export type Match = {
  id: string;
  gameName: string;
  room: string;
  date: string;
  players: number;
  winner: string;
  duration: string;
};

export const matches: Match[] = [
  { id: "m1", gameName: "Quiz Bíblico", room: "Jovens Betel", date: "23/05/2026 — 19:42", players: 28, winner: "Gabriel Santos", duration: "18 min" },
  { id: "m2", gameName: "Verdadeiro ou Falso", room: "EBD Adultos", date: "22/05/2026 — 09:15", players: 19, winner: "Sarah Oliveira", duration: "12 min" },
  { id: "m3", gameName: "Versículo Completo", room: "Classe Timóteo", date: "21/05/2026 — 20:00", players: 14, winner: "Tiago Mendes", duration: "22 min" },
  { id: "m4", gameName: "Quem é o Personagem?", room: "Kids Manhã", date: "21/05/2026 — 10:30", players: 22, winner: "Ana Clara", duration: "15 min" },
  { id: "m5", gameName: "Corrida de Perguntas", room: "Encontro Casais", date: "20/05/2026 — 21:10", players: 16, winner: "Beatriz Souza", duration: "9 min" },
  { id: "m6", gameName: "Quiz Bíblico", room: "Célula Família Lima", date: "19/05/2026 — 20:45", players: 11, winner: "Marcos Lima", duration: "20 min" },
  { id: "m7", gameName: "Verdadeiro ou Falso", room: "Jovens Betel", date: "18/05/2026 — 19:30", players: 24, winner: "João Pedro", duration: "14 min" },
  { id: "m8", gameName: "Versículo Completo", room: "EBD Adultos", date: "17/05/2026 — 09:20", players: 17, winner: "Letícia Rocha", duration: "25 min" },
  { id: "m9", gameName: "Quem é o Personagem?", room: "Adolescentes", date: "16/05/2026 — 19:00", players: 20, winner: "Daniel Alves", duration: "17 min" },
  { id: "m10", gameName: "Quiz Bíblico", room: "Jovens Betel", date: "15/05/2026 — 19:40", players: 26, winner: "Camila Dias", duration: "19 min" },
];

export const statusLabel: Record<GameStatus, string> = {
  active: "Ativo",
  beta: "Beta",
  maintenance: "Manutenção",
  "coming-soon": "Em breve",
};
