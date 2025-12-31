import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Laptop, Monitor, Trash2, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const DeviceManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ['user-devices-management', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toggleTrustMutation = useMutation({
    mutationFn: async ({ deviceId, isTrusted }: { deviceId: string; isTrusted: boolean }) => {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_trusted: isTrusted })
        .eq('id', deviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices-management'] });
      toast.success('Configuração do dispositivo atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar dispositivo');
    },
  });

  const removeDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices-management'] });
      toast.success('Dispositivo removido');
    },
    onError: () => {
      toast.error('Erro ao remover dispositivo');
    },
  });

  const getDeviceIcon = (os: string | null) => {
    const osLower = os?.toLowerCase() || '';
    if (osLower.includes('android') || osLower.includes('ios')) {
      return <Smartphone className="h-6 w-6" />;
    }
    if (osLower.includes('windows') || osLower.includes('mac') || osLower.includes('linux')) {
      return <Laptop className="h-6 w-6" />;
    }
    return <Monitor className="h-6 w-6" />;
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
          <CardTitle>Dispositivos Conhecidos</CardTitle>
          <CardDescription>
            Gerencie os dispositivos que têm acesso à sua conta. Dispositivos confiáveis não disparam alertas de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices && devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${device.is_trusted ? 'bg-green-500/10' : 'bg-muted'}`}>
                      {getDeviceIcon(device.os)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{device.browser || 'Navegador desconhecido'}</span>
                        {device.is_trusted && (
                          <Badge variant="default" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Confiável
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{device.os || 'SO desconhecido'}</span>
                        {device.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {device.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        Último acesso: {device.last_seen_at 
                          ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true, locale: ptBR })
                          : 'Desconhecido'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confiável</span>
                      <Switch
                        checked={device.is_trusted || false}
                        onCheckedChange={(checked) => 
                          toggleTrustMutation.mutate({ deviceId: device.id, isTrusted: checked })
                        }
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O dispositivo será removido da lista. Na próxima vez que fizer login deste dispositivo, você receberá um alerta de novo dispositivo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeDeviceMutation.mutate(device.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo registrado</p>
              <p className="text-sm mt-1">Faça login para registrar este dispositivo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
