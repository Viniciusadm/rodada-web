import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <PageHeader title="Configurações" description="Ajuste as preferências da sua igreja e da plataforma." />

      <Tabs defaultValue="church">
        <TabsList className="mb-6">
          <TabsTrigger value="church">Igreja</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="church">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="church-name">Nome da igreja</Label>
              <Input id="church-name" defaultValue="Igreja Betel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader">Responsável</Label>
              <Input id="leader" defaultValue="Líder Juventude" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de contato</Label>
              <Input id="email" type="email" defaultValue="contato@igrejabetel.com" />
            </div>
            <Button className="rounded-lg" onClick={() => toast.success("Configurações salvas")}>
              Salvar alterações
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <Label className="mb-3 block">Tema</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      theme === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`mb-3 h-16 rounded-lg ${t === "dark" ? "bg-slate-900" : "bg-slate-100"}`} />
                    <p className="text-sm font-medium capitalize">{t === "dark" ? "Escuro" : "Claro"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t === "dark" ? "Confortável à noite" : "Brilhante e leve"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            {[
              { id: "new-rooms", label: "Novas salas ao vivo", desc: "Receba aviso quando alguém abrir uma sala." },
              { id: "ranking", label: "Atualizações de ranking", desc: "Quando subir ou cair de posição." },
              { id: "weekly", label: "Resumo semanal", desc: "Relatório das atividades da semana." },
            ].map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={n.id} className="text-sm font-medium">{n.label}</Label>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch id={n.id} defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
