import { getApiBaseUrl } from "@/lib/api-client";

export type RealtimeEvent<T = unknown> = {
  channel: string;
  kind: string;
  payload: T;
};

export type RealtimeConnection = {
  close: () => void;
  join: (channel: string) => void;
  leave: (channel: string) => void;
};

export function connectRealtime<T>(params: {
  token: string;
  channel: string;
  onEvent: (event: RealtimeEvent<T>) => void;
  onError?: (error: { code: string; message: string; connection_id?: string }) => void;
  onDisconnect?: () => void;
}): RealtimeConnection {
  let socket: WebSocket | null = null;
  let closedByClient = false;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  const joinedChannels = new Set<string>();

  const connect = () => {
    const url = new URL("/ws", getApiBaseUrl());
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("token", params.token);
    url.searchParams.set("channel", params.channel);

    socket = new WebSocket(url);
    socket.addEventListener("open", () => {
      reconnectAttempt = 0;
      for (const channel of joinedChannels) {
        if (channel !== params.channel) send({ type: "join", channel });
      }
      heartbeatTimer = setInterval(() => send({ type: "ping" }), 20_000);
    });
    socket.addEventListener("message", (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent<T>;
        if (event.kind === "error") {
          params.onError?.(
            event.payload as { code: string; message: string; connection_id?: string },
          );
          return;
        }
        params.onEvent(event);
      } catch {
        params.onError?.({ code: "invalid_json", message: "Invalid realtime event." });
      }
    });
    socket.addEventListener("close", () => {
      clearHeartbeat();
      params.onDisconnect?.();
      if (!closedByClient) scheduleReconnect();
    });
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    const delay = Math.min(1_000 * 2 ** reconnectAttempt, 15_000);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  const clearHeartbeat = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };

  const send = (message: unknown) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  connect();

  return {
    close: () => {
      closedByClient = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearHeartbeat();
      socket?.close();
    },
    join: (channel: string) => {
      joinedChannels.add(channel);
      send({ type: "join", channel });
    },
    leave: (channel: string) => {
      joinedChannels.delete(channel);
      send({ type: "leave", channel });
    },
  };
}
