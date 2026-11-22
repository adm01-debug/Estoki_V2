import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Users,
  Lock,
  CheckCircle2,
  Settings2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const ROLE_INFO: Record<string, { name: string; description: string; color: string }> = {
  admin: {
    name: "Administrador",
    description: "Acesso total ao sistema, configurações e gestão de usuários.",
    color: "bg-red-500",
  },
  supervisor: {
    name: "Supervisor",
    description: "Gestão operacional, relatórios e aprovação de movimentações.",
    color: "bg-blue-500",
  },
  operador: {
    name: "Operador",
    description: "Execução de tarefas de triagem, picking e conferência.",
    color: "bg-slate-500",
  },
};

interface UserRoleRow {
  role: string;
}

async function fetchUserCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("user_roles").select("role");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as UserRoleRow[]) {
    counts[row.role] = (counts[row.role] ?? 0) + 1;
  }
  return counts;
}

export default function RolesPage() {
  const { permissions, rolePermissions, loading, saving, getPermissionsByCategory, refresh } =
    usePermissions();

  const [openRole, setOpenRole] = useState<string | null>(null);

  const {
    data: userCounts = {},
    isLoading: countsLoading,
    refetch: refetchCounts,
  } = useQuery({
    queryKey: ["role-user-counts"],
    queryFn: fetchUserCounts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: false,
  });

  const permissionsByCategory = useMemo(
    () => getPermissionsByCategory(),
    [getPermissionsByCategory]
  );

  const getGrantedCount = (role: string): number => {
    return rolePermissions.filter((rp) => rp.role === role && rp.granted).length;
  };

  const grantedCodes = (role: string): string[] => {
    const grantedPermissionIds = new Set(
      rolePermissions.filter((rp) => rp.role === role && rp.granted).map((rp) => rp.permission_id)
    );
    return permissions.filter((p) => grantedPermissionIds.has(p.id)).map((p) => p.code);
  };

  const handleRefresh = async () => {
    await Promise.all([refresh(), refetchCounts()]);
    toast.success("Dados atualizados");
  };

  if (loading || countsLoading) {
    return (
      <AppLayout title="Níveis de Acesso" showBack>
        <PageTransition>
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Níveis de Acesso" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <CardDescription>
              Configure os níveis de acesso do sistema. Contagem de usuários por cargo.
            </CardDescription>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={saving}>
              <RefreshCw className={`mr-2 h-4 w-4 ${saving ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Object.entries(ROLE_INFO).map(([roleId, info]) => (
              <Card key={roleId} className="relative overflow-hidden border-sidebar-border/50">
                <div className={`h-1.5 w-full ${info.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-sidebar-accent/50 p-2">
                      <Shield
                        className={`h-5 w-5 ${roleId === "admin" ? "text-red-500" : "text-primary"}`}
                      />
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> {userCounts[roleId] ?? 0} usuários
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{info.name}</CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                      <Lock className="h-3 w-3" /> Permissões Principais
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {grantedCodes(roleId)
                        .slice(0, 6)
                        .map((code) => (
                          <Badge
                            key={code}
                            variant="secondary"
                            className="font-mono text-[10px] lowercase"
                          >
                            {code}
                          </Badge>
                        ))}
                      {grantedCodes(roleId).length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Nenhuma permissão concedida
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-sidebar-border/50 pt-2">
                    <Dialog
                      open={openRole === roleId}
                      onOpenChange={(open) => setOpenRole(open ? roleId : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="group w-full justify-between text-xs"
                          size="sm"
                        >
                          Ver permissões detalhadas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Permissões — {info.name}</DialogTitle>
                          <DialogDescription>
                            {getGrantedCount(roleId)} de {permissions.length} permissões ativas
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          {Object.entries(permissionsByCategory).map(([category, perms]) => {
                            const grantedInCategory = perms.filter((p) =>
                              rolePermissions.some(
                                (rp) =>
                                  rp.role === roleId && rp.permission_id === p.id && rp.granted
                              )
                            ).length;
                            return (
                              <Accordion key={category} type="single" collapsible>
                                <AccordionItem value={category} className="rounded-lg border px-4">
                                  <AccordionTrigger className="hover:no-underline">
                                    <div className="flex w-full items-center justify-between pr-4">
                                      <span className="font-medium">{category}</span>
                                      <Badge
                                        variant={
                                          grantedInCategory === perms.length
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {grantedInCategory}/{perms.length}
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      {perms.map((perm) => {
                                        const granted = rolePermissions.some(
                                          (rp) =>
                                            rp.role === roleId &&
                                            rp.permission_id === perm.id &&
                                            rp.granted
                                        );
                                        return (
                                          <div
                                            key={perm.id}
                                            className={`flex items-center gap-2 rounded p-2 text-sm ${
                                              granted
                                                ? "bg-green-500/10 text-green-700"
                                                : "bg-muted/30 text-muted-foreground"
                                            }`}
                                          >
                                            {granted ? (
                                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                            ) : (
                                              <Lock className="h-4 w-4 flex-shrink-0" />
                                            )}
                                            <span className="truncate">{perm.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-dashed bg-sidebar-accent/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Precisa de um cargo personalizado?</h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                Os três níveis de acesso são fixos. Configure as permissões de cada cargo na Central
                de Segurança.
              </p>
              <Alert className="mx-auto max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Para editar permissões por cargo, acesse Segurança → Acessos → Permissões.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
