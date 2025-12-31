import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldCheck, ShieldAlert, Monitor, Key, Bell, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityScore {
  total: number;
  items: {
    name: string;
    status: 'complete' | 'incomplete' | 'warning';
    points: number;
    maxPoints: number;
  }[];
}

export const SecurityOverview: React.FC = () => {
  const { user } = useAuth();

  const { data: devices } = useQuery({
    queryKey: ['user-devices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: loginLogs } = useQuery({
    queryKey: ['login-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
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

  const trustedDevices = devices?.filter(d => d.is_trusted) || [];
  const recentFailedLogins = loginLogs?.filter(l => !l.success) || [];

  const securityScore: SecurityScore = {
    total: 0,
    items: [
      {
        name: 'Email verificado',
        status: user?.email_confirmed_at ? 'complete' : 'incomplete',
        points: user?.email_confirmed_at ? 20 : 0,
        maxPoints: 20,
      },
      {
        name: 'Autenticação MFA',
        status: 'incomplete', // MFA not yet implemented
        points: 0,
        maxPoints: 30,
      },
      {
        name: 'Dispositivos confiáveis',
        status: trustedDevices.length > 0 ? 'complete' : 'warning',
        points: trustedDevices.length > 0 ? 15 : 0,
        maxPoints: 15,
      },
      {
        name: 'Sem logins suspeitos',
        status: recentFailedLogins.length === 0 ? 'complete' : 'warning',
        points: recentFailedLogins.length === 0 ? 20 : 10,
        maxPoints: 20,
      },
      {
        name: 'Perfil completo',
        status: user?.user_metadata?.name ? 'complete' : 'incomplete',
        points: user?.user_metadata?.name ? 15 : 0,
        maxPoints: 15,
      },
    ],
  };

  securityScore.total = securityScore.items.reduce((acc, item) => acc + item.points, 0);
  const maxScore = securityScore.items.reduce((acc, item) => acc + item.maxPoints, 0);
  const scorePercentage = Math.round((securityScore.total / maxScore) * 100);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excelente', variant: 'default' as const };
    if (percentage >= 50) return { label: 'Moderado', variant: 'secondary' as const };
    return { label: 'Crítico', variant: 'destructive' as const };
  };

  const scoreBadge = getScoreBadge(scorePercentage);

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-primary/10 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage >= 80 ? (
                  <ShieldCheck className="h-8 w-8" />
                ) : scorePercentage >= 50 ? (
                  <Shield className="h-8 w-8" />
                ) : (
                  <ShieldAlert className="h-8 w-8" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">Pontuação de Segurança</CardTitle>
                <CardDescription>Avaliação geral da segurança da sua conta</CardDescription>
              </div>
            </div>
            <Badge variant={scoreBadge.variant} className="text-lg px-4 py-1">
              {scoreBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`text-5xl font-bold ${getScoreColor(scorePercentage)}`}>
                {securityScore.total}
              </span>
              <span className="text-2xl text-muted-foreground">/ {maxScore}</span>
            </div>
            <Progress value={scorePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Security Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Verificação de Segurança</CardTitle>
          <CardDescription>Complete estas etapas para melhorar a segurança da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityScore.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={item.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.name}
                  </span>
                </div>
                <Badge variant={item.status === 'complete' ? 'default' : 'secondary'}>
                  {item.points}/{item.maxPoints} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Monitor className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{devices?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Dispositivos registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Key className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{userRole || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Nível de acesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Bell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentFailedLogins.length}</p>
                <p className="text-sm text-muted-foreground">Tentativas suspeitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
