import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/AsyncStates";
import {
  Search,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { highestRole, type AppRoleValue } from "@/utils/role";

interface UserProfile {
  id: string;
  nome: string | null;
  email: string | null;
  role?: string;
  status?: "ativo" | "inativo";
  last_login?: string;
}

async function fetchUsers(): Promise<UserProfile[]> {
  const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
  if (pError) throw pError;

  const { data: roles, error: rError } = await supabase.from("user_roles").select("user_id, role");
  if (rError) throw rError;

  const rolesByUser = new Map<string, string[]>();
  for (const r of roles || []) {
    const list = rolesByUser.get(r.user_id) ?? [];
    list.push(r.role);
    rolesByUser.set(r.user_id, list);
  }

  return (profiles || []).map((p) => ({
    ...p,
    role: highestRole(rolesByUser.get(p.id) ?? []) || "operador",
    status: "ativo" as const,
  }));
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleUser, setRoleUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRoleValue>("operador");
  const [savingRole, setSavingRole] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users-list"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: false,
  });

  const openRoleDialog = (user: UserProfile) => {
    setRoleUser(user);
    setSelectedRole((user.role as AppRoleValue) ?? "operador");
  };

  const handleAssignRole = async () => {
    if (!roleUser) return;
    setSavingRole(true);
    try {
      // F001: "Alterar Cargo" deve SUBSTITUIR, nao acumular.
      // Ordem segura: garante o novo papel ANTES de remover os antigos. Sem
      // transacao no client, remover primeiro deixaria o usuario sem papel algum
      // caso o insert falhasse.
      const { data: papeisAtuais, error: papeisError } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", roleUser.id);

      if (papeisError) throw papeisError;

      const jaTemPapel = (papeisAtuais ?? []).some((r) => r.role === selectedRole);
      if (!jaTemPapel) {
        const { error: insertError } = await supabase.from("user_roles").insert({
          user_id: roleUser.id,
          role: selectedRole,
        });
        if (insertError) throw insertError;
      }

      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", roleUser.id)
        .neq("role", selectedRole);

      if (deleteError) throw deleteError;

      toast({ title: "Cargo alterado", description: `Papel atualizado para ${selectedRole}.` });
      await queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setRoleUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao alterar cargo.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setSavingRole(false);
    }
  };

  if (isError) {
    return (
      <AppLayout title="Gerenciamento de Usuários" showBack>
        <PageTransition>
          <div className="p-6">
            <ErrorState
              message={`Erro ao carregar usuários: ${String((error as Error)?.message ?? error)}`}
              onRetry={() => void refetch()}
            />
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="border-red-500/20 bg-red-500/10 text-red-500">Administrador</Badge>
        );
      case "supervisor":
        return (
          <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-500">Supervisor</Badge>
        );
      default:
        return <Badge variant="secondary">Operador</Badge>;
    }
  };

  return (
    <AppLayout title="Gerenciamento de Usuários" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Buscar por nome ou email"
                placeholder="Buscar por nome ou email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full gap-2 md:w-auto">
              <UserPlus className="h-4 w-4" />
              Convidar Usuário
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Todos os Usuários</CardTitle>
              <CardDescription>Gerencie acessos e permissões dos colaboradores</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Nível de Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              {user.nome?.charAt(0) || user.email?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.nome || "Sem nome"}</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" /> {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Ativo</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-label="Mais ações" variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-primary"
                                onSelect={() => openRoleDialog(user)}
                              >
                                <Shield className="h-4 w-4" /> Alterar Cargo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" /> Desativar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Cargo</DialogTitle>
              <DialogDescription>
                Defina o nível de acesso de {roleUser?.nome || roleUser?.email || "este usuário"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as AppRoleValue)}
              >
                <SelectTrigger aria-label="Selecione o cargo" className="w-full">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleAssignRole}
                disabled={savingRole || !roleUser}
              >
                {savingRole ? "Salvando..." : "Salvar Cargo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}
