import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Users, UserCog, User, 
  Package, Truck, ClipboardList, BarChart3, 
  Settings, Bell, CheckCircle2, XCircle,
  Loader2, RefreshCw, Info
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

const ROLE_INFO = {
  admin: {
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  supervisor: {
    name: 'Supervisor',
    description: 'Gerencia operações e equipes',
    icon: UserCog,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  operador: {
    name: 'Operador',
    description: 'Executa tarefas operacionais',
    icon: User,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
};

const CATEGORY_ICONS: Record<string, any> = {
  'Estoque': Package,
  'Recebimento': Truck,
  'Triagem': ClipboardList,
  'Tarefas': ClipboardList,
  'Expedição': Truck,
  'Relatórios': BarChart3,
  'Configurações': Settings,
  'Alertas': Bell,
};

export const PermissionsManager: React.FC = () => {
  const { 
    permissions, 
    rolePermissions, 
    loading, 
    saving,
    getPermissionsByCategory, 
    togglePermission,
    refresh 
  } = usePermissions();
  
  const [selectedRole, setSelectedRole] = useState<'operador' | 'supervisor' | 'admin'>('operador');
  
  const permissionsByCategory = useMemo(() => getPermissionsByCategory(), [getPermissionsByCategory]);
  
  const isPermissionGranted = (permissionId: string): boolean => {
    const rp = rolePermissions.find(
      r => r.role === selectedRole && r.permission_id === permissionId
    );
    return rp?.granted ?? false;
  };

  const getGrantedCount = (role: string): number => {
    return rolePermissions.filter(rp => rp.role === role && rp.granted).length;
  };

  const handleToggle = async (permissionId: string, currentValue: boolean) => {
    if (selectedRole === 'admin') {
      toast.error('Não é possível alterar permissões do Administrador');
      return;
    }
    await togglePermission(selectedRole, permissionId, !currentValue);
  };

  const handleGrantAll = async (category: string) => {
    if (selectedRole === 'admin') return;
    
    const categoryPermissions = permissionsByCategory[category] || [];
    for (const perm of categoryPermissions) {
      if (!isPermissionGranted(perm.id)) {
        await togglePermission(selectedRole, perm.id, true);
      }
    }
  };

  const handleRevokeAll = async (category: string) => {
    if (selectedRole === 'admin') return;
    
    const categoryPermissions = permissionsByCategory[category] || [];
    for (const perm of categoryPermissions) {
      if (isPermissionGranted(perm.id)) {
        await togglePermission(selectedRole, perm.id, false);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gerenciador de Permissões</CardTitle>
                <CardDescription>
                  Configure as permissões de acesso para cada role do sistema
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Role Selection */}
      <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'operador' | 'supervisor' | 'admin')}>
        <TabsList className="grid w-full grid-cols-3">
          {(['operador', 'supervisor', 'admin'] as const).map(role => {
            const info = ROLE_INFO[role];
            const Icon = info.icon;
            const grantedCount = getGrantedCount(role);
            
            return (
              <TabsTrigger key={role} value={role} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${info.color}`} />
                <span>{info.name}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {grantedCount}/{permissions.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(['operador', 'supervisor', 'admin'] as const).map(role => {
          const info = ROLE_INFO[role];
          
          return (
            <TabsContent key={role} value={role} className="mt-6">
              {/* Role Info Card */}
              <Card className={`mb-6 border-2 ${role === 'admin' ? 'border-red-500/30' : 'border-transparent'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${info.bgColor}`}>
                      <info.icon className={`h-8 w-8 ${info.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{info.name}</h3>
                      <p className="text-muted-foreground">{info.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{getGrantedCount(role)}</p>
                      <p className="text-sm text-muted-foreground">permissões ativas</p>
                    </div>
                  </div>
                  
                  {role === 'admin' && (
                    <Alert className="mt-4 border-red-500/30 bg-red-500/5">
                      <Info className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-600">
                        O Administrador possui todas as permissões por padrão e não pode ser restringido.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Permissions by Category */}
              <Accordion type="multiple" defaultValue={Object.keys(permissionsByCategory)} className="space-y-2">
                {Object.entries(permissionsByCategory).map(([category, perms]) => {
                  const CategoryIcon = CATEGORY_ICONS[category] || Settings;
                  const grantedInCategory = perms.filter(p => isPermissionGranted(p.id)).length;
                  
                  return (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={grantedInCategory === perms.length ? 'default' : 'secondary'}>
                              {grantedInCategory}/{perms.length}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="py-2 space-y-1">
                          {role !== 'admin' && (
                            <div className="flex gap-2 mb-4 pb-4 border-b">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGrantAll(category)}
                                disabled={saving}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                                Conceder Todas
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeAll(category)}
                                disabled={saving}
                              >
                                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                Revogar Todas
                              </Button>
                            </div>
                          )}
                          
                          {perms.map(permission => {
                            const isGranted = isPermissionGranted(permission.id);
                            
                            return (
                              <div
                                key={permission.id}
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                  isGranted ? 'bg-green-500/5' : 'bg-muted/30'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{permission.name}</span>
                                    <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                      {permission.code}
                                    </code>
                                  </div>
                                  {permission.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {saving && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                  <Switch
                                    checked={isGranted}
                                    onCheckedChange={() => handleToggle(permission.id, isGranted)}
                                    disabled={role === 'admin' || saving}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
