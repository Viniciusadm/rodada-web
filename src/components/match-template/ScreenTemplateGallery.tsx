import type { ReactNode } from "react";
import { Check, Loader2, PenLine } from "lucide-react";
import type { Document } from "@ribaltalang/compiler";
import { RendererHostContext } from "@ribaltalang/renderer/host";
import { PageView, ScaledPage } from "@ribaltalang/renderer/PageView";

import { cn } from "@/lib/utils";
import { presentScreenHost, type ScreenTemplate } from "@/lib/present-screen";

export const CUSTOM_SCREEN = "custom";

type Props = {
  templates: ScreenTemplate[] | undefined;
  loading: boolean;
  selected: string | null;
  custom: Document | null;
  onPick: (template: ScreenTemplate) => void;
};

function ScreenThumbnail({ document }: { document: Document }) {
  const page = document.pages[0];
  if (!page) return null;
  return (
    <RendererHostContext.Provider value={presentScreenHost}>
      <ScaledPage width={page.width} height={page.height}>
        <PageView doc={document} page={page} />
      </ScaledPage>
    </RendererHostContext.Provider>
  );
}

function GalleryCard({
  active,
  title,
  description,
  preview,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  preview: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card text-left transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-primary ring-2 ring-primary"
          : "border-border hover:border-primary/60 disabled:hover:border-border",
      )}
    >
      <div className="pointer-events-none aspect-video bg-black">{preview}</div>
      {active && (
        <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Check className="size-4" />
        </span>
      )}
      <div className="space-y-1 p-3">
        <p className={cn("font-medium", active ? "text-primary" : "group-hover:text-primary")}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export function ScreenTemplateGallery({ templates, loading, selected, custom, onPick }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center rounded-xl border border-border py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates?.map((template) => (
        <GalleryCard
          key={template.id}
          active={selected === template.id}
          title={template.name}
          description={template.description}
          preview={<ScreenThumbnail document={template.document} />}
          onClick={() => onPick(template)}
        />
      ))}
      {selected === CUSTOM_SCREEN && (
        <GalleryCard
          active
          title="Personalizado"
          description="Telão editado no código. Escolha um modelo para voltar a ele."
          preview={
            custom ? (
              <ScreenThumbnail document={custom} />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                <PenLine className="size-8" />
              </div>
            )
          }
        />
      )}
    </div>
  );
}
