import { Sparkles } from "lucide-react";

export function ComingSoonCard({ title = "Em breve", description = "Novo jogo em desenvolvimento para sua igreja." }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-[24ch] text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
