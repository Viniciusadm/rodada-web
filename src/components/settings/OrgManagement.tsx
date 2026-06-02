import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAddMember,
  useArchiveTeam,
  useCreateTeam,
  useMembersQuery,
  useOrganizationQuery,
  useRemoveMember,
  useTeamsQuery,
  useUpdateMemberRole,
  useUpdateOrganization,
  useUpdateTeam,
} from "@/features/games-hub-data";
import { useActiveRole } from "@/hooks/use-active-role";
import type { OrgMember } from "@/lib/api-client";

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  host: "Apresentador",
  member: "Membro",
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export function OrganizationSettings() {
  const { data: org, isLoading } = useOrganizationQuery();
  const updateOrg = useUpdateOrganization();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (!org) return;
    setName(org.name);
    setContactEmail(org.contactEmail ?? "");
  }, [org]);

  async function save() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome da organização.");
      return;
    }
    try {
      await updateOrg.mutateAsync({
        name: name.trim(),
        contactEmail: contactEmail.trim() || null,
      });
      toast.success("Organização atualizada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Label className="mb-1 block">Organização</Label>
      <p className="mb-4 text-xs text-muted-foreground">Dados da sua organização.</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Nome</Label>
            <Input id="org-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org-email">E-mail de contato</Label>
            <Input
              id="org-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="contato@exemplo.com"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={updateOrg.isPending}>
              {updateOrg.isPending && <Loader2 className="mr-1 size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TeamsSettings() {
  const { data: teams = [], isLoading } = useTeamsQuery();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const archiveTeam = useArchiveTeam();
  const [newName, setNewName] = useState("");

  async function add() {
    const name = newName.trim();
    if (name.length < 2) return;
    try {
      await createTeam.mutateAsync(name);
      setNewName("");
      toast.success("Time criado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar o time.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Label className="mb-1 block">Times / ministérios</Label>
      <p className="mb-4 text-xs text-muted-foreground">
        Organize jogadores por time ou ministério.
      </p>

      <div className="mb-4 flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") add();
          }}
          placeholder="Nome do novo time"
        />
        <Button onClick={add} disabled={createTeam.isPending || !newName.trim()}>
          <Plus className="mr-1 size-4" /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum time cadastrado.</p>
      ) : (
        <div className="divide-y divide-border">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{team.name}</span>
                {!team.isActive && <Badge variant="secondary">Inativo</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ativo</span>
                  <Switch
                    checked={team.isActive}
                    disabled={updateTeam.isPending}
                    onCheckedChange={(checked) =>
                      updateTeam.mutate({ teamId: team.id, isActive: checked })
                    }
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={archiveTeam.isPending}
                  onClick={() => archiveTeam.mutate(team.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MembersSettings() {
  const role = useActiveRole();
  const { data: members = [], isLoading } = useMembersQuery();
  const addMember = useAddMember();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [toRemove, setToRemove] = useState<OrgMember | null>(null);

  const isOwner = role === "owner";

  async function invite() {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await addMember.mutateAsync({ email: trimmed, role: newRole });
      setEmail("");
      setNewRole("member");
      toast.success("Membro adicionado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível adicionar.");
    }
  }

  async function changeRole(member: OrgMember, value: string) {
    try {
      await updateRole.mutateAsync({ userId: member.userId, role: value });
      toast.success("Papel atualizado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar o papel.");
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    try {
      await removeMember.mutateAsync(toRemove.userId);
      toast.success("Membro removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    } finally {
      setToRemove(null);
    }
  }

  // Only owners may assign the owner role.
  const roleOptions = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter((o) => o.value !== "owner");

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Label className="mb-1 block">Membros e papéis</Label>
      <p className="mb-4 text-xs text-muted-foreground">
        Convide pessoas (que já tenham conta) e defina o papel de cada uma.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemplo.com"
          className="min-w-[180px] flex-1"
        />
        <Select value={newRole} onValueChange={setNewRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={invite} disabled={addMember.isPending || !email.trim()}>
          <Plus className="mr-1 size-4" /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="divide-y divide-border">
          {members.map((member) => {
            const ownerLocked = member.role === "owner" && !isOwner;
            return (
              <div key={member.userId} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    disabled={ownerLocked || updateRole.isPending}
                    onValueChange={(value) => changeRole(member, value)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={ownerLocked}
                    onClick={() => setToRemove(member)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={toRemove != null} onOpenChange={(open) => !open && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {toRemove?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              A pessoa perderá o acesso a esta organização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} disabled={removeMember.isPending}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
