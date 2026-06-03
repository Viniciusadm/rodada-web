import { create } from "zustand";

import {
  fetchMe,
  loginRequest,
  onUnauthorized,
  registerRequest,
  setAccessToken,
  type AuthUser,
} from "@/lib/api-client";

const TOKEN_KEY = "games-hub-token";

export type AuthStatus = "idle" | "loading" | "authed" | "anon";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { displayName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function writeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

const ANON_STATE = {
  status: "anon" as const,
  token: null,
  user: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  status: "idle",
  error: null,

  bootstrap: async () => {
    const status = get().status;
    if (status === "loading" || status === "authed") return;
    const token = readToken();
    if (!token) {
      set({ ...ANON_STATE });
      return;
    }
    set({ status: "loading", token });
    setAccessToken(token);
    try {
      const session = await fetchMe();
      set({ status: "authed", token, user: session.user, error: null });
    } catch {
      writeToken(null);
      setAccessToken(null);
      set({ ...ANON_STATE });
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const result = await loginRequest(email, password);
      writeToken(result.access_token);
      setAccessToken(result.access_token);
      const session = await fetchMe();
      set({ status: "authed", token: result.access_token, user: session.user, error: null });
    } catch (error) {
      writeToken(null);
      setAccessToken(null);
      set({
        ...ANON_STATE,
        error: error instanceof Error ? error.message : "Falha ao entrar.",
      });
      throw error;
    }
  },

  register: async ({ displayName, email, password }) => {
    set({ status: "loading", error: null });
    try {
      const result = await registerRequest({ displayName, email, password });
      writeToken(result.access_token);
      setAccessToken(result.access_token);
      const session = await fetchMe();
      set({ status: "authed", token: result.access_token, user: session.user, error: null });
    } catch (error) {
      writeToken(null);
      setAccessToken(null);
      set({
        ...ANON_STATE,
        error: error instanceof Error ? error.message : "Falha ao criar conta.",
      });
      throw error;
    }
  },

  logout: () => {
    writeToken(null);
    setAccessToken(null);
    set({ ...ANON_STATE, error: null });
  },
}));

onUnauthorized(() => {
  const state = useAuthStore.getState();
  if (state.status !== "anon") {
    state.logout();
  }
});
