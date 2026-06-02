import { createFileRoute } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useTheme } from "@/components/theme-provider";
import {
  MembersSettings,
  OrganizationSettings,
  TeamsSettings,
} from "@/components/settings/OrgManagement";
import { useCanManageOrg } from "@/hooks/use-active-role";
import {
  useNotificationPreferencesQuery,
  useSetNotificationPreference,
} from "@/features/games-hub-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Games Hub" },
      { name: "description", content: "Personalize sua experiência no Games Hub." },
    ],
  }),
  component: SettingsPage,
});

const PREFERENCE_LABELS: Record<string, { title: string; description: string }> = {
  new_rooms: {
    title: "Novas salas e partidas",
    description: "Avise quando uma partida iniciar ou uma sala ficar ao vivo.",
  },
  ranking_updates: {
    title: "Atualizações de ranking",
    description: "Receba avisos quando o ranking mudar.",
  },
};

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: preferences = [], isLoading } = useNotificationPreferencesQuery();
  const setPreference = useSetNotificationPreference();
  const canManage = useCanManageOrg();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Configurações" description="Ajuste as preferências disponíveis." />

      {canManage && (
        <>
          <OrganizationSettings />
          <TeamsSettings />
          <MembersSettings />
        </>
      )}

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

      <div className="rounded-2xl border border-border bg-card p-6">
        <Label className="mb-1 block">Notificações</Label>
        <p className="mb-4 text-xs text-muted-foreground">
          Escolha sobre o que você quer ser avisado.
        </p>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="divide-y divide-border">
            {preferences.map((preference) => {
              const meta = PREFERENCE_LABELS[preference.key] ?? {
                title: preference.key,
                description: "",
              };
              return (
                <div key={preference.key} className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="text-sm font-medium">{meta.title}</p>
                    {meta.description && (
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={preference.enabled}
                    disabled={setPreference.isPending}
                    onCheckedChange={(enabled) =>
                      setPreference.mutate({ key: preference.key, enabled })
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
