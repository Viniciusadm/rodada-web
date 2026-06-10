import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listGeneralQuestions,
  listMatches,
  listMatchRounds,
  listMatchTemplates,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type GeneralQuestionPage,
  type MatchRoundDetail,
  type MatchSummary,
  type MatchTemplateSummary,
} from "@/lib/api-client";

export function useGeneralQuestionsQuery(params: {
  search: string;
  page: number;
  pageSize?: number;
}) {
  return useQuery<GeneralQuestionPage>({
    queryKey: ["general-questions", "list", params.search, params.page],
    queryFn: () =>
      listGeneralQuestions({
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function useMatchesQuery() {
  return useQuery<MatchSummary[]>({
    queryKey: ["matches"],
    queryFn: listMatches,
    staleTime: 10_000,
  });
}

export function useMatchTemplatesQuery(search: string) {
  return useQuery<MatchTemplateSummary[]>({
    queryKey: ["match-templates", "list", search],
    queryFn: () => listMatchTemplates(search),
    placeholderData: keepPreviousData,
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
