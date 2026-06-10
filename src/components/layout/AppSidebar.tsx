import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, History, Library, PlusCircle, Swords } from "lucide-react";

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
import { useAuthStore } from "@/stores/auth";

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
    label: "Jogar",
    items: [
      { title: "Início", url: "/", icon: Home },
      { title: "Nova partida", url: "/matches/new", icon: PlusCircle },
      { title: "Partidas", url: "/matches", icon: Swords },
      { title: "Perguntas gerais", url: "/general-questions", icon: Library },
    ],
  },
  {
    label: "Acompanhar",
    items: [{ title: "Histórico", url: "/history", icon: History }],
  },
];

const allItems = groups.flatMap((group) => group.items);

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuthStore((s) => s.user);

  const matches = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(`${path}/`);

  const activeUrl = allItems
    .filter((item) => matches(item.url))
    .reduce<
      string | null
    >((best, item) => (!best || item.url.length > best.length ? item.url : best), null);

  const userName = user?.displayName ?? "Conta";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
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
                    <SidebarMenuButton
                      asChild
                      isActive={item.url === activeUrl}
                      tooltip={item.title}
                    >
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
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-foreground">
            {initialsOf(userName) || "U"}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{userName}</p>
            {user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
