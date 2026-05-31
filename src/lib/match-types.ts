export type GameMode = "classico" | "pontos-iniciais" | "eliminacao";
export type MatchStatus = "aguardando" | "em-andamento" | "encerrada";

export type MatchQuestionDraft = {
  text: string;
  answer: string;
  points: number;
};

export const getModeLabel = (mode: GameMode) =>
  ({
    classico: "Clássico",
    "pontos-iniciais": "Pontos iniciais",
    eliminacao: "Eliminação",
  })[mode];

export const getStatusLabel = (status: MatchStatus) =>
  ({
    aguardando: "Aguardando",
    "em-andamento": "Em andamento",
    encerrada: "Encerrada",
  })[status];

export function parseCsv(csv: string): MatchQuestionDraft[] {
  return csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [text = "", answer = "", points = "100"] = line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((part) => part.trim().replace(/^"|"$/g, ""));
      return {
        text,
        answer,
        points: Number(points) || 100,
      };
    })
    .filter((row) => row.text && row.answer);
}
