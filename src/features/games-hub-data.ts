import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listMatches,
  listMatchRounds,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type MatchRoundDetail,
  type MatchSummary,
} from "@/lib/api-client";

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
