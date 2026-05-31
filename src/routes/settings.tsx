import { createFileRoute } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — HolyPlay" },
      { name: "description", content: "Personalize sua experiência na HolyPlay." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configurações" description="Ajuste as preferências disponíveis." />

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label className="mb-3 block">Tema</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  theme === t
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className={`mb-3 h-16 rounded-lg ${t === "dark" ? "bg-slate-900" : "bg-slate-100"}`}
                />
                <p className="text-sm font-medium capitalize">
                  {t === "dark" ? "Escuro" : "Claro"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t === "dark" ? "Confortável à noite" : "Brilhante e leve"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
