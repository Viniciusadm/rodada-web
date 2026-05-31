import { getApiBaseUrl } from "@/lib/api-client";

export type RealtimeEvent<T = unknown> = {
  channel: string;
  kind: string;
  payload: T;
};

export type RealtimeConnection = {
  close: () => void;
};

export function connectRealtime<T>(params: {
  token: string;
  channel: string;
  onEvent: (event: RealtimeEvent<T>) => void;
  onDisconnect?: () => void;
}): RealtimeConnection {
  const url = new URL("/ws", getApiBaseUrl());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", params.token);
  url.searchParams.set("channel", params.channel);

  const socket = new WebSocket(url);
  socket.addEventListener("message", (message) => {
    params.onEvent(JSON.parse(message.data) as RealtimeEvent<T>);
  });
  socket.addEventListener("close", () => params.onDisconnect?.());

  return {
    close: () => socket.close(),
  };
}
