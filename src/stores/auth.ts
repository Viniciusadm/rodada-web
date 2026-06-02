import { create } from "zustand";

import {
  fetchMe,
  loginRequest,
  onUnauthorized,
  registerRequest,
  setAccessToken,
  setActiveOrganizationId,
  type AuthOrganization,
  type AuthSession,
  type AuthUser,
} from "@/lib/api-client";

const TOKEN_KEY = "games-hub-token";
const ACTIVE_ORG_KEY = "games-hub-active-org";

function readActiveOrg(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ORG_KEY);
}

function writeActiveOrg(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    window.localStorage.setItem(ACTIVE_ORG_KEY, id);
  } else {
    window.localStorage.removeItem(ACTIVE_ORG_KEY);
  }
}

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
  register: (input: { displayName: string; email: string; password: string }) => Promise<void>;
  setActiveOrganization: (organizationId: string) => void;
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
  // Prefer the org the user last switched to (persisted locally), as long as it
  // is still one they belong to; otherwise fall back to the session default.
  const persisted = readActiveOrg();
  const active =
    session.organizations.find((org) => org.id === persisted) ??
    session.organizations.find((org) => org.id === session.activeOrganizationId) ??
    session.organizations[0] ??
    null;
  setActiveOrganizationId(active?.id ?? null);
  writeActiveOrg(active?.id ?? null);
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

  register: async ({ displayName, email, password }) => {
    set({ status: "loading", error: null });
    try {
      const result = await registerRequest({ displayName, email, password });
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
        error: error instanceof Error ? error.message : "Falha ao criar conta.",
      });
      throw error;
    }
  },

  setActiveOrganization: (organizationId) => {
    const org = get().organizations.find((item) => item.id === organizationId);
    if (!org) return;
    setActiveOrganizationId(org.id);
    writeActiveOrg(org.id);
    set({ activeOrganization: org });
  },

  logout: () => {
    writeToken(null);
    setAccessToken(null);
    setActiveOrganizationId(null);
    writeActiveOrg(null);
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
