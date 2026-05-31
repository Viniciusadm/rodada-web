import { create } from "zustand";

import {
  fetchMe,
  loginRequest,
  onUnauthorized,
  setAccessToken,
  setActiveOrganizationId,
  type AuthOrganization,
  type AuthSession,
  type AuthUser,
} from "@/lib/api-client";

const TOKEN_KEY = "holyplay-token";

export type AuthStatus = "idle" | "loading" | "authed" | "anon";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  organizations: AuthOrganization[];
  activeOrganization: AuthOrganization | null;
  status: AuthStatus;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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

function sessionToState(session: AuthSession) {
  const active =
    session.organizations.find((org) => org.id === session.activeOrganizationId) ??
    session.organizations[0] ??
    null;
  setActiveOrganizationId(active?.id ?? null);
  return {
    status: "authed" as const,
    user: session.user,
    organizations: session.organizations,
    activeOrganization: active,
    error: null,
  };
}

const ANON_STATE = {
  status: "anon" as const,
  token: null,
  user: null,
  organizations: [],
  activeOrganization: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  organizations: [],
  activeOrganization: null,
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
      set(sessionToState(session));
    } catch {
      writeToken(null);
      setAccessToken(null);
      setActiveOrganizationId(null);
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
      set({ token: result.access_token, ...sessionToState(session) });
    } catch (error) {
      writeToken(null);
      setAccessToken(null);
      setActiveOrganizationId(null);
      set({
        ...ANON_STATE,
        error: error instanceof Error ? error.message : "Falha ao entrar.",
      });
      throw error;
    }
  },

  logout: () => {
    writeToken(null);
    setAccessToken(null);
    setActiveOrganizationId(null);
    set({ ...ANON_STATE, error: null });
  },
}));

// When any authenticated request comes back 401, drop the session.
onUnauthorized(() => {
  const state = useAuthStore.getState();
  if (state.status !== "anon") {
    state.logout();
  }
});
