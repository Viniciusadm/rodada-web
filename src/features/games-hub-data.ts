import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPreferences,
  listGames,
  listLiveRooms,
  listMatches,
  listNotifications,
  listPlayers,
  listRankings,
  listTeams,
  markAllNotificationsRead,
  markNotificationRead,
  searchOrganization,
  setNotificationPreference,
  type AppNotification,
  type Game,
  type LiveRoom,
  type MatchSummary,
  type NotificationPreference,
  type Player,
  type RankingEntry,
  type SearchResults,
  type Team,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth";

function useActiveOrgId() {
  return useAuthStore((state) => state.activeOrganization?.id ?? null);
}

export function useGamesQuery() {
  return useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: listGames,
    staleTime: 60_000,
  });
}

export function useTeamsQuery() {
  const orgId = useActiveOrgId();
  return useQuery<Team[]>({
    queryKey: ["teams", orgId],
    queryFn: () => listTeams(orgId!),
    enabled: !!orgId,
    staleTime: 300_000,
  });
}

export function usePlayersQuery() {
  const orgId = useActiveOrgId();
  return useQuery<Player[]>({
    queryKey: ["players", orgId],
    queryFn: async () => {
      const teams = await listTeams(orgId!);
      const map = new Map(teams.map((team) => [team.id, team.name]));
      return listPlayers(orgId!, map);
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });
}

export function useRankingQuery() {
  const orgId = useActiveOrgId();
  return useQuery<RankingEntry[]>({
    queryKey: ["ranking", orgId],
    queryFn: async () => {
      const teams = await listTeams(orgId!);
      const map = new Map(teams.map((team) => [team.id, team.name]));
      return listRankings(orgId!, map);
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });
}

export function useLiveRoomsQuery() {
  const orgId = useActiveOrgId();
  return useQuery<LiveRoom[]>({
    queryKey: ["live-rooms", orgId],
    queryFn: () => listLiveRooms(orgId!),
    enabled: !!orgId,
    staleTime: 10_000,
  });
}

export function useMatchesQuery() {
  const orgId = useActiveOrgId();
  return useQuery<MatchSummary[]>({
    queryKey: ["matches", orgId],
    queryFn: () => listMatches(orgId!),
    enabled: !!orgId,
    staleTime: 10_000,
  });
}

export function useNotificationsQuery() {
  const orgId = useActiveOrgId();
  return useQuery<AppNotification[]>({
    queryKey: ["notifications", orgId],
    queryFn: () => listNotifications(orgId!),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", orgId] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", orgId] }),
  });
}

export function useNotificationPreferencesQuery() {
  const orgId = useActiveOrgId();
  return useQuery<NotificationPreference[]>({
    queryKey: ["notification-preferences", orgId],
    queryFn: () => getNotificationPreferences(orgId!),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}

export function useSetNotificationPreference() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      setNotificationPreference(key, enabled, orgId!),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", orgId] }),
  });
}

export function useSearchQuery(term: string) {
  const orgId = useActiveOrgId();
  const trimmed = term.trim();
  return useQuery<SearchResults>({
    queryKey: ["search", orgId, trimmed],
    queryFn: () => searchOrganization(trimmed, orgId!),
    enabled: !!orgId && trimmed.length >= 2,
    staleTime: 10_000,
  });
}
