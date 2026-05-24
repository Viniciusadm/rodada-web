import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted ring-1 ring-border">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[36ch] text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
