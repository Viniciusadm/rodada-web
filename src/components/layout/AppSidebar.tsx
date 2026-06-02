import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Gamepad2,
  Radio,
  Trophy,
  Users,
  History,
  PlusCircle,
  Settings,
  Swords,
  Check,
  ChevronsUpDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  host: "Apresentador",
  member: "Membro",
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const groups = [
  {
    label: "Principal",
    items: [
      { title: "Início", url: "/", icon: Home },
      { title: "Jogos", url: "/games", icon: Gamepad2 },
      { title: "Partidas", url: "/matches", icon: Swords },
      { title: "Salas ao vivo", url: "/rooms", icon: Radio },
      { title: "Ranking", url: "/ranking", icon: Trophy },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { title: "Jogadores", url: "/players", icon: Users },
      { title: "Histórico", url: "/history", icon: History },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Nova partida", url: "/matches/new", icon: PlusCircle },
      { title: "Configurações", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const activeOrganization = useAuthStore((s) => s.activeOrganization);
  const organizations = useAuthStore((s) => s.organizations);
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const orgName = activeOrganization?.name ?? "Games Hub";
  const roleLabel = activeOrganization
    ? (ROLE_LABELS[activeOrganization.role] ?? "Membro")
    : "Hub de jogos";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
            <Gamepad2 className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-base font-semibold tracking-tight">Games Hub</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {organizations.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/30 text-xs font-semibold text-foreground">
                  {initialsOf(orgName) || "GH"}
                </div>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-medium">{orgName}</p>
                  <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Organizações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={() => setActiveOrganization(org.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrganization?.id && <Check className="size-4 shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/30 text-xs font-semibold text-foreground">
              {initialsOf(orgName) || "GH"}
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{orgName}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
