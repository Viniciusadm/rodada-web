import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { connectRealtime, type RealtimeEvent } from "@/lib/realtime-client";
import { useAuthStore } from "@/stores/auth";

type UseRealtimeInvalidationParams = {
  channel: string | null;
  matchId?: string;
  organizationId?: string | null;
};

export function useRealtimeInvalidation({
  channel,
  matchId,
  organizationId,
}: UseRealtimeInvalidationParams) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(false);
    if (!token || !channel) return;

    const connection = connectRealtime({
      token,
      channel,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onError: () => setConnected(false),
      onEvent: (event) => {
        invalidateByEvent(event, queryClient, { matchId, organizationId });
      },
    });

    return () => {
      connection.close();
    };
  }, [channel, matchId, organizationId, queryClient, token]);

  return { connected };
}

function invalidateByEvent(
  event: RealtimeEvent,
  queryClient: ReturnType<typeof useQueryClient>,
  scope: { matchId?: string; organizationId?: string | null },
) {
  if (
    ["match_created", "match_updated", "buzzer_updated", "room_updated"].includes(event.kind) &&
    scope.matchId
  ) {
    void queryClient.invalidateQueries({ queryKey: ["match-state", scope.matchId] });
  }

  if (["match_created", "match_updated", "room_updated"].includes(event.kind)) {
    void queryClient.invalidateQueries({
      queryKey: scope.organizationId ? ["matches", scope.organizationId] : ["matches"],
    });
    void queryClient.invalidateQueries({
      queryKey: scope.organizationId ? ["live-rooms", scope.organizationId] : ["live-rooms"],
    });
  }

  if (event.kind === "ranking_updated") {
    void queryClient.invalidateQueries({
      queryKey: scope.organizationId ? ["ranking", scope.organizationId] : ["ranking"],
    });
    void queryClient.invalidateQueries({
      queryKey: scope.organizationId ? ["players", scope.organizationId] : ["players"],
    });
  }
}
