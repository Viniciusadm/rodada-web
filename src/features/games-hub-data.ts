import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addMember,
  archiveTeam,
  createPlayer,
  createTeam,
  getNotificationPreferences,
  getOrganization,
  listGames,
  listGamesForAdmin,
  listLiveRooms,
  listMatches,
  listMatchRounds,
  listMembers,
  listNotifications,
  listPlayers,
  listRankings,
  listTeams,
  markAllNotificationsRead,
  markNotificationRead,
  removeMember,
  searchOrganization,
  setNotificationPreference,
  updateMemberRole,
  updateOrganization,
  updatePlayer,
  updateTeam,
  type AppNotification,
  type Game,
  type LiveRoom,
  type MatchRoundDetail,
  type MatchSummary,
  type NotificationPreference,
  type OrganizationDetail,
  type OrgMember,
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

export function useAdminGamesQuery() {
  const orgId = useActiveOrgId();
  return useQuery<Game[]>({
    queryKey: ["admin-games", orgId],
    queryFn: () => listGamesForAdmin(orgId!),
    enabled: !!orgId,
    staleTime: 30_000,
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

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (name: string) => createTeam(name, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams", orgId] }),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: { teamId: string; name?: string; isActive?: boolean }) =>
      updateTeam(input.teamId, { name: input.name, isActive: input.isActive }, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams", orgId] }),
  });
}

export function useArchiveTeam() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (teamId: string) => archiveTeam(teamId, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams", orgId] }),
  });
}

export function useMembersQuery() {
  const orgId = useActiveOrgId();
  return useQuery<OrgMember[]>({
    queryKey: ["members", orgId],
    queryFn: () => listMembers(orgId!),
    enabled: !!orgId,
    staleTime: 30_000,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: { email: string; role: string }) => addMember(input, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: { userId: string; role: string }) =>
      updateMemberRole(input.userId, input.role, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (userId: string) => removeMember(userId, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useOrganizationQuery() {
  const orgId = useActiveOrgId();
  return useQuery<OrganizationDetail>({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganization(orgId!),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: { name: string; contactEmail: string | null }) =>
      updateOrganization(input, orgId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organization", orgId] }),
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

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: { displayName: string; ministryId: string | null }) =>
      createPlayer({ ...input, organizationId: orgId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players", orgId] }),
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (input: {
      playerId: string;
      displayName?: string;
      ministryId?: string | null;
      isActive?: boolean;
    }) => updatePlayer(input.playerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players", orgId] }),
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

export function useMatchRoundsQuery(matchId: string | null, options?: { enabled?: boolean }) {
  return useQuery<MatchRoundDetail[]>({
    queryKey: ["match-rounds", matchId],
    queryFn: () => listMatchRounds(matchId!),
    enabled: !!matchId && (options?.enabled ?? true),
    staleTime: 30_000,
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
