import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Lock,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Globe,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionsManager } from "./PermissionsManager";
import { GeoBlockingManager } from "./GeoBlockingManager";
import { PasswordResetApproval } from "./PasswordResetApproval";
import { Skeleton } from "@/components/ui/skeleton";

export const AccessControl: React.FC = () => {
  const { user } = useAuth();
  const { permissions, rolePermissions, userRole, loading, getPermissionsByCategory } =
    usePermissions();

  const permissionsByCategory = useMemo(
    () => getPermissionsByCategory(),
    [getPermissionsByCategory]
  );

  const roles = [
    {
      id: "admin",
      name: "Administrador",
      description:
        "Acesso completo ao sistema, incluindo configurações e gerenciamento de usuários",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    {
      id: "supervisor",
      name: "Supervisor",
      description: "Pode gerenciar operações e visualizar relatórios de equipe",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      id: "operador",
      name: "Operador",
      description: "Acesso às operações básicas de triagem, separação e movimentação",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
  ];

  const getGrantedCount = (role: string): number => {
    return rolePermissions.filter((rp) => rp.role === role && rp.granted).length;
  };

  const isPermissionGranted = (permissionId: string, role: string): boolean => {
    const rp = rolePermissions.find((r) => r.role === role && r.permission_id === permissionId);
    return rp?.granted ?? false;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tabs defaultValue="my-access" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="my-access" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Acesso
        </TabsTrigger>
        <TabsTrigger value="manage" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Permissões
        </TabsTrigger>
        <TabsTrigger value="geo" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Geo
        </TabsTrigger>
        <TabsTrigger value="reset" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Reset Senha
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-access" className="space-y-6">
        {/* Current Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Seu Nível de Acesso
            </CardTitle>
            <CardDescription>Seu papel atual no sistema e as permissões associadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`rounded-lg border p-4 transition-all ${
                    userRole === role.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "opacity-50"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${role.color}`} />
                    <span className="font-medium">{role.name}</span>
                    {userRole === role.id && (
                      <Badge variant="default" className="ml-auto text-xs">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="mt-3 border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      {getGrantedCount(role.id)} permissões ativas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Permissões</CardTitle>
            <CardDescription>
              Permissões concedidas ao seu papel (
              {roles.find((r) => r.id === userRole)?.name || "Operador"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionsByCategory).map(([category, perms]) => {
                const grantedInCategory = perms.filter((p) =>
                  isPermissionGranted(p.id, userRole || "operador")
                ).length;

                return (
                  <div key={category} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant={grantedInCategory === perms.length ? "default" : "secondary"}>
                        {grantedInCategory}/{perms.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((permission) => {
                        const isGranted = isPermissionGranted(
                          permission.id,
                          userRole || "operador"
                        );

                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center gap-2 rounded p-2 text-sm ${
                              isGranted
                                ? "bg-green-500/10 text-green-700"
                                : "bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            {isGranted ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="truncate">{permission.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle>Hierarquia de Papéis (RBAC)</CardTitle>
            <CardDescription>Sistema de controle de acesso baseado em papéis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 py-6">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ${userRole === "admin" ? "ring-2 ring-red-500" : ""}`}
                >
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
                <span className="mt-2 font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Acesso Total</span>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 ${userRole === "supervisor" ? "ring-2 ring-yellow-500" : ""}`}
                >
                  <Users className="h-8 w-8 text-yellow-500" />
                </div>
                <span className="mt-2 font-medium">Supervisor</span>
                <span className="text-xs text-muted-foreground">Gerenciamento</span>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 ${userRole === "operador" ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
                <span className="mt-2 font-medium">Operador</span>
                <span className="text-xs text-muted-foreground">Operações</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage">
        <PermissionsManager />
      </TabsContent>

      <TabsContent value="geo">
        <GeoBlockingManager />
      </TabsContent>

      <TabsContent value="reset">
        <PasswordResetApproval />
      </TabsContent>
    </Tabs>
  );
};
