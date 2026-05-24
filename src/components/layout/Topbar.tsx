import { Bell, Moon, Search, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function Topbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="size-9" />
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar jogos, salas ou jogadores..."
          className="h-10 rounded-full border-transparent bg-muted/60 pl-10 focus-visible:border-ring/30 focus-visible:ring-2 focus-visible:ring-ring/20"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggle} aria-label="Alternar tema">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notificações">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </Button>
        <div className="ml-1 hidden items-center gap-2.5 sm:flex">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">Líder Juventude</p>
            <p className="text-xs text-muted-foreground">Igreja Betel</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/40 text-xs font-semibold ring-2 ring-primary/20">
            LJ
          </div>
        </div>
      </div>
    </header>
  );
}
