import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Laptop, Globe, Clock, MapPin, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export const ActiveSessions: React.FC = () => {
  const { user } = useAuth();

  const { data: loginLogs, isLoading, refetch } = useQuery({
    queryKey: ['login-logs-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('login_logs')
        .select('*, user_devices(*)')
        .eq('user_id', user.id)
        .eq('success', true)
        .order('login_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getDeviceIcon = (os: string | null, browser: string | null) => {
    const osLower = os?.toLowerCase() || '';
    if (osLower.includes('android') || osLower.includes('ios')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  const handleRevokeAll = async () => {
    toast.info('Funcionalidade de revogar sessões será implementada em breve');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>Histórico de logins e sessões da sua conta</CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={handleRevokeAll}>
              <LogOut className="h-4 w-4 mr-2" />
              Encerrar Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loginLogs && loginLogs.length > 0 ? (
            <div className="space-y-4">
              {loginLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${index === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getDeviceIcon(log.os, log.browser)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.browser || 'Navegador desconhecido'}</span>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sessão Atual
                          </Badge>
                        )}
                        {log.is_new_device && (
                          <Badge variant="secondary" className="text-xs">Novo dispositivo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {log.os || 'SO desconhecido'}
                        </span>
                        {log.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {log.login_at ? formatDistanceToNow(new Date(log.login_at), { addSuffix: true, locale: ptBR }) : 'Data desconhecida'}
                    </div>
                    {log.login_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.login_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
