import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { RendererHostContext } from "@ribaltalang/renderer/host";
import { PageView, ScaledPage } from "@ribaltalang/renderer/PageView";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getScreenTemplates, presentScreenHost, type ScreenTemplate } from "@/lib/present-screen";

type Props = {
  disabled?: boolean;
  onPick: (template: ScreenTemplate) => void;
};

export function ScreenTemplatePicker({ disabled, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const templates = useQuery({
    queryKey: ["present-screen-templates"],
    queryFn: getScreenTemplates,
    staleTime: Number.POSITIVE_INFINITY,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={disabled}
        >
          <LayoutTemplate className="mr-1 size-3.5" /> Modelos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Começar de um modelo</DialogTitle>
          <DialogDescription>
            O modelo substitui o texto atual do telão. Dá para desfazer com Ctrl+Z.
          </DialogDescription>
        </DialogHeader>
        {templates.isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.data?.map((template) => {
            const page = template.document.pages[0];
            return (
              <button
                key={template.id}
                type="button"
                className="group overflow-hidden rounded-xl border border-border text-left transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => {
                  onPick(template);
                  setOpen(false);
                }}
              >
                <div className="pointer-events-none aspect-video bg-black">
                  {page && (
                    <RendererHostContext.Provider value={presentScreenHost}>
                      <ScaledPage width={page.width} height={page.height}>
                        <PageView doc={template.document} page={page} />
                      </ScaledPage>
                    </RendererHostContext.Provider>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="font-medium group-hover:text-primary">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
