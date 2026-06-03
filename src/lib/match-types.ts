export type GameMode = "classico" | "pontos-iniciais" | "eliminacao";
export type MatchStatus = "aguardando" | "em-andamento" | "encerrada";
export type DraftQuestionType = "true_false" | "free_text" | "multiple_choice";
export type DraftOption = { text: string; correct: boolean };

export type MatchQuestionDraft = {
  type: DraftQuestionType;
  text: string;
  answer: string;
  options?: DraftOption[];
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

function splitCsvLine(line: string): string[] {
  return line
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((part) => part.trim().replace(/^"|"$/g, ""));
}

function parseCsvType(value: string): DraftQuestionType | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "texto" || normalized === "free_text") return "free_text";
  if (normalized === "vf" || normalized === "v/f" || normalized === "true_false") {
    return "true_false";
  }
  if (normalized === "multipla" || normalized === "múltipla" || normalized === "multiple_choice") {
    return "multiple_choice";
  }
  return null;
}

function parseCsvOptions(raw: string): DraftOption[] {
  return raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) =>
      value.startsWith("*")
        ? { text: value.slice(1).trim(), correct: true }
        : { text: value, correct: false },
    );
}

export function parseCsv(csv: string): MatchQuestionDraft[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rows: MatchQuestionDraft[] = [];

  lines.forEach((line, index) => {
    const lowered = line.toLowerCase();
    if (index === 0 && (lowered.includes("pergunta") || lowered.includes("prompt"))) {
      return;
    }
    const columns = splitCsvLine(line);
    const keyword = parseCsvType(columns[0] ?? "");
    const type = keyword ?? "free_text";
    const text = (keyword ? columns[1] : columns[0]) ?? "";
    const answer = (keyword ? columns[2] : columns[1]) ?? "";
    const pointsRaw = (keyword ? columns[3] : columns[2]) ?? "100";
    const optionsRaw = keyword ? (columns[4] ?? "") : "";
    const points = Number(pointsRaw) || 100;

    if (!text) return;

    if (type === "multiple_choice") {
      const options = parseCsvOptions(optionsRaw);
      if (options.length < 2 || options.filter((option) => option.correct).length !== 1) {
        return;
      }
      const correct = options.find((option) => option.correct);
      rows.push({ type, text, answer: correct?.text ?? "", options, points });
      return;
    }

    if (type === "true_false") {
      const normalized = ["true", "verdadeiro", "v", "1", "sim"].includes(answer.toLowerCase())
        ? "true"
        : "false";
      rows.push({ type, text, answer: normalized, points });
      return;
    }

    if (!answer) return;
    rows.push({ type: "free_text", text, answer, points });
  });

  return rows;
}
