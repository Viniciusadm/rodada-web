import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formata uma data ISO para "dd/mm/aaaa hh:mm" no fuso local; "—" se nula/inválida. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

/** Formata uma duração em segundos como "1 h 5 min", "12 min 30 s" ou "45 s"; "—" se nula. */
export function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${secs} s`;
  return `${secs} s`;
}
