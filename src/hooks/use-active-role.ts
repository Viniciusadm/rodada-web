import { useAuthStore } from "@/stores/auth";

export type OrgRole = "owner" | "admin" | "host" | "member";

/** Role of the current user in the active organization, or null if unknown. */
export function useActiveRole(): OrgRole | null {
  return useAuthStore((state) => (state.activeOrganization?.role as OrgRole | undefined) ?? null);
}

/** Owner/admin may manage the org: teams, members, org settings, game catalog. */
export function useCanManageOrg(): boolean {
  const role = useActiveRole();
  return role === "owner" || role === "admin";
}

/** Owner/admin/host may run matches and manage players. */
export function useCanHost(): boolean {
  const role = useActiveRole();
  return role === "owner" || role === "admin" || role === "host";
}
