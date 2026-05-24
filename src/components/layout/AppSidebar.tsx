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
  Sparkles,
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

const groups = [
  {
    label: "Principal",
    items: [
      { title: "Início", url: "/", icon: Home },
      { title: "Jogos", url: "/games", icon: Gamepad2 },
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
      { title: "Criar jogo", url: "/create-game", icon: PlusCircle },
      { title: "Configurações", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/20">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-base font-semibold tracking-tight">HolyPlay</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hub de jogos cristãos
            </span>
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
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/30 text-xs font-semibold text-foreground">
            IB
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">Igreja Betel</p>
            <p className="truncate text-xs text-muted-foreground">Ministério Jovem</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
