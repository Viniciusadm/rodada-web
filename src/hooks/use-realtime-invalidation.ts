import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { mapMatchState } from "@/lib/api-client";
import {
  connectRealtime,
  type MatchRealtimePayload,
  type RealtimeEvent,
} from "@/lib/realtime-client";
import { useAuthStore } from "@/stores/auth";

type UseRealtimeInvalidationParams = {
  channel: string | null;
  matchId?: string;
};

export function useRealtimeInvalidation({ channel, matchId }: UseRealtimeInvalidationParams) {
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
        invalidateByEvent(event, queryClient, { matchId });
      },
    });

    return () => {
      connection.close();
    };
  }, [channel, matchId, queryClient, token]);

  return { connected };
}

function invalidateByEvent(
  event: RealtimeEvent,
  queryClient: ReturnType<typeof useQueryClient>,
  scope: { matchId?: string },
) {
  const stateAffectingKinds = [
    "match_created",
    "match_updated",
    "buzzer_updated",
    "room_updated",
    "ranking_updated",
  ];

  if (stateAffectingKinds.includes(event.kind) && scope.matchId) {
    const pushed = (event.payload as MatchRealtimePayload | undefined)?.state;
    if (pushed) {
      queryClient.setQueryData(["match-state", scope.matchId], mapMatchState(pushed));
    } else {
      void queryClient.invalidateQueries({ queryKey: ["match-state", scope.matchId] });
    }
  }

  if (["match_created", "match_updated", "room_updated"].includes(event.kind)) {
    void queryClient.invalidateQueries({ queryKey: ["matches"] });
  }
}
