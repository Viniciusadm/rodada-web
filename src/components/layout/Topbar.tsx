import { useState } from "react";
import { Bell, Check, LogOut, Moon, Search, Sun } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useSearchQuery,
} from "@/features/games-hub-data";
import { useAuthStore } from "@/stores/auth";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Topbar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeOrganization = useAuthStore((s) => s.activeOrganization);
  const logout = useAuthStore((s) => s.logout);

  const userName = user?.displayName ?? "Conta";
  const orgName = activeOrganization?.name ?? "Games Hub";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="size-9" />
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggle}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <NotificationsBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2.5 rounded-full pl-1 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:pr-2">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{orgName}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/40 text-xs font-semibold ring-2 ring-primary/20">
                {initialsOf(userName) || "U"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                void navigate({ to: "/login" });
              }}
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useSearchQuery(term);

  const hasResults =
    !!data && (data.games.length > 0 || data.players.length > 0 || data.rooms.length > 0);
  const showPanel = open && term.trim().length >= 2;

  const go = (to: string) => {
    setOpen(false);
    setTerm("");
    void navigate({ to });
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar jogos, salas ou jogadores..."
        className="h-10 rounded-full border-transparent bg-muted/60 pl-10 focus-visible:border-ring/30 focus-visible:ring-2 focus-visible:ring-ring/20"
      />
      {showPanel && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {isFetching && !hasResults && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Buscando...</p>
          )}
          {!isFetching && !hasResults && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          )}
          {hasResults && (
            <div className="max-h-80 overflow-y-auto py-1">
              <SearchGroup
                label="Jogos"
                items={data!.games.map((g) => ({ id: g.id, label: g.name }))}
                onSelect={() => go("/games")}
              />
              <SearchGroup
                label="Jogadores"
                items={data!.players.map((p) => ({ id: p.id, label: p.displayName }))}
                onSelect={() => go("/players")}
              />
              <SearchGroup
                label="Salas ao vivo"
                items={data!.rooms.map((r) => ({
                  id: r.matchId,
                  label: `${r.name} · PIN ${r.pin}`,
                }))}
                onSelect={(id) => go(`/matches/${id}/host`)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="py-1">
      <p className="px-4 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item.id)}
          className="block w-full truncate px-4 py-2 text-left text-sm hover:bg-accent"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function NotificationsBell() {
  const { data: notifications = [] } = useNotificationsQuery();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Notificações"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação.
          </p>
        )}
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-2 px-3 py-2.5 text-sm ${
                notification.read ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{notification.title}</p>
                {notification.body && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{notification.body}</p>
                )}
              </div>
              {!notification.read && (
                <button
                  onClick={() => markRead.mutate(notification.id)}
                  className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-accent"
                  aria-label="Marcar como lido"
                >
                  <Check className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
