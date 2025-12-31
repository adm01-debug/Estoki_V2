import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Mail, Smartphone, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SecurityAlerts: React.FC = () => {
  const { user } = useAuth();

  const { data: loginLogs } = useQuery({
    queryKey: ['login-logs-alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const failedLogins = loginLogs?.filter(l => !l.success) || [];
  const newDeviceLogins = loginLogs?.filter(l => l.is_new_device) || [];

  const alertSettings = [
    {
      id: 'new-device',
      title: 'Login de novo dispositivo',
      description: 'Receba um alerta quando houver login de um dispositivo desconhecido',
      enabled: true,
    },
    {
      id: 'failed-login',
      title: 'Tentativas de login falhas',
      description: 'Receba um alerta após múltiplas tentativas de login incorretas',
      enabled: true,
    },
    {
      id: 'password-change',
      title: 'Alteração de senha',
      description: 'Receba um alerta quando sua senha for alterada',
      enabled: true,
    },
    {
      id: 'mfa-change',
      title: 'Alterações no MFA',
      description: 'Receba um alerta quando MFA for ativado ou desativado',
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Alertas
          </CardTitle>
          <CardDescription>
            Configure quais eventos de segurança devem gerar notificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {alertSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{setting.title}</Label>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch checked={setting.enabled} />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-4">Canais de Notificação</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Switch checked={true} className="ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push</p>
                  <p className="text-sm text-muted-foreground">Navegador</p>
                </div>
                <Switch checked={false} className="ml-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Eventos de Segurança Recentes
          </CardTitle>
          <CardDescription>
            Histórico de eventos de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(failedLogins.length > 0 || newDeviceLogins.length > 0) ? (
            <div className="space-y-3">
              {failedLogins.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="p-2 rounded-full bg-destructive/10">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Tentativa de login falha</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{log.browser} - {log.os}</span>
                      {log.location && <span>• {log.location}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {log.login_at ? formatDistanceToNow(new Date(log.login_at), { addSuffix: true, locale: ptBR }) : ''}
                  </div>
                </div>
              ))}
              
              {newDeviceLogins.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-yellow-600">Login de novo dispositivo</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{log.browser} - {log.os}</span>
                      {log.location && <span>• {log.location}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {log.login_at ? formatDistanceToNow(new Date(log.login_at), { addSuffix: true, locale: ptBR }) : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p>Nenhum evento de segurança recente</p>
              <p className="text-sm mt-1">Sua conta está segura</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
