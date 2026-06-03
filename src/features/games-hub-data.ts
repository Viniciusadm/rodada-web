import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPlayer,
  listMatches,
  listMatchRounds,
  listNotifications,
  listPlayers,
  listRankings,
  markAllNotificationsRead,
  markNotificationRead,
  searchOrganization,
  updatePlayer,
  type AppNotification,
  type MatchRoundDetail,
  type MatchSummary,
  type Player,
  type RankingEntry,
  type SearchResults,
} from "@/lib/api-client";

export function usePlayersQuery() {
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: listPlayers,
    staleTime: 30_000,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { displayName: string }) => createPlayer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { playerId: string; displayName?: string; isActive?: boolean }) =>
      updatePlayer(input.playerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useRankingQuery() {
  return useQuery<RankingEntry[]>({
    queryKey: ["ranking"],
    queryFn: listRankings,
    staleTime: 30_000,
  });
}

export function useMatchesQuery() {
  return useQuery<MatchSummary[]>({
    queryKey: ["matches"],
    queryFn: listMatches,
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
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useSearchQuery(term: string) {
  const trimmed = term.trim();
  return useQuery<SearchResults>({
    queryKey: ["search", trimmed],
    queryFn: () => searchOrganization(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 10_000,
  });
}
