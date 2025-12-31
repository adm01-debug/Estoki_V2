import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Lock, Eye, Edit, Trash, Plus, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AccessControl: React.FC = () => {
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user-role-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      return data?.role || 'operador';
    },
    enabled: !!user?.id,
  });

  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acesso completo ao sistema, incluindo configurações e gerenciamento de usuários',
      color: 'bg-red-500',
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Pode gerenciar operações e visualizar relatórios de equipe',
      color: 'bg-yellow-500',
    },
    {
      id: 'operador',
      name: 'Operador',
      description: 'Acesso às operações básicas de triagem, separação e movimentação',
      color: 'bg-blue-500',
    },
  ];

  const permissions = {
    admin: {
      produtos: ['visualizar', 'criar', 'editar', 'excluir'],
      estoque: ['visualizar', 'criar', 'editar', 'excluir'],
      tarefas: ['visualizar', 'criar', 'editar', 'excluir', 'atribuir'],
      usuarios: ['visualizar', 'criar', 'editar', 'excluir'],
      relatorios: ['visualizar', 'exportar'],
      configuracoes: ['visualizar', 'editar'],
    },
    supervisor: {
      produtos: ['visualizar', 'criar', 'editar'],
      estoque: ['visualizar', 'criar', 'editar'],
      tarefas: ['visualizar', 'criar', 'editar', 'atribuir'],
      usuarios: ['visualizar'],
      relatorios: ['visualizar', 'exportar'],
      configuracoes: ['visualizar'],
    },
    operador: {
      produtos: ['visualizar'],
      estoque: ['visualizar'],
      tarefas: ['visualizar', 'executar'],
      usuarios: [],
      relatorios: [],
      configuracoes: [],
    },
  };

  const currentPermissions = permissions[userRole as keyof typeof permissions] || permissions.operador;

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'visualizar': return <Eye className="h-3 w-3" />;
      case 'criar': return <Plus className="h-3 w-3" />;
      case 'editar': return <Edit className="h-3 w-3" />;
      case 'excluir': return <Trash className="h-3 w-3" />;
      case 'atribuir': return <Users className="h-3 w-3" />;
      case 'executar': return <Settings className="h-3 w-3" />;
      case 'exportar': return <Settings className="h-3 w-3" />;
      default: return null;
    }
  };

  const modules = [
    { id: 'produtos', name: 'Produtos', icon: Shield },
    { id: 'estoque', name: 'Estoque', icon: Shield },
    { id: 'tarefas', name: 'Tarefas', icon: Shield },
    { id: 'usuarios', name: 'Usuários', icon: Users },
    { id: 'relatorios', name: 'Relatórios', icon: Shield },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Current Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Seu Nível de Acesso
          </CardTitle>
          <CardDescription>
            Seu papel atual no sistema e as permissões associadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`flex-1 p-4 rounded-lg border ${
                  userRole === role.id 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${role.color}`} />
                  <span className="font-medium">{role.name}</span>
                  {userRole === role.id && (
                    <Badge variant="default" className="ml-auto text-xs">Atual</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permissões</CardTitle>
          <CardDescription>
            Suas permissões em cada módulo do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module) => {
              const modulePermissions = currentPermissions[module.id as keyof typeof currentPermissions] || [];
              const hasAccess = modulePermissions.length > 0;

              return (
                <div
                  key={module.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    hasAccess ? 'bg-card' : 'bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasAccess ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAccess ? (
                      modulePermissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs flex items-center gap-1">
                          {getPermissionIcon(perm)}
                          {perm}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">Sem acesso</Badge>
                    )}
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
          <CardDescription>
            Sistema de controle de acesso baseado em papéis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <span className="font-medium mt-2">Admin</span>
              <span className="text-xs text-muted-foreground">Acesso Total</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
              <span className="font-medium mt-2">Supervisor</span>
              <span className="text-xs text-muted-foreground">Gerenciamento</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
              <span className="font-medium mt-2">Operador</span>
              <span className="text-xs text-muted-foreground">Operações</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
