import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Key, Smartphone, Mail, Shield, ShieldCheck, ShieldOff, QrCode, AlertTriangle, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMFA } from '@/hooks/useMFA';
import { MFAEnroll } from '@/components/MFAEnroll';
import { toast } from 'sonner';
import PasskeySettings from './PasskeySettings';

export const MFASettings: React.FC = () => {
  const { user } = useAuth();
  const { factors, loading, listFactors, unenroll, getVerifiedFactors } = useMFA();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [verifiedFactors, setVerifiedFactors] = useState<any[]>([]);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    const verified = await getVerifiedFactors();
    setVerifiedFactors(verified);
    setIsMFAEnabled(verified.length > 0);
  };

  const handleEnrollSuccess = () => {
    setEnrollDialogOpen(false);
    loadMFAStatus();
  };

  const handleUnenroll = async (factorId: string) => {
    if (!confirm('Tem certeza que deseja desativar este método de autenticação?')) return;
    
    const success = await unenroll(factorId);
    if (success) {
      toast.success('Método de autenticação removido');
      loadMFAStatus();
    } else {
      toast.error('Erro ao remover método de autenticação');
    }
  };

  const mfaMethods = [
    {
      id: 'totp',
      name: 'Aplicativo Autenticador (TOTP)',
      description: 'Use um aplicativo como Google Authenticator ou Authy para gerar códigos',
      icon: Smartphone,
      enabled: verifiedFactors.some(f => f.factor_type === 'totp'),
      recommended: true,
      factors: verifiedFactors.filter(f => f.factor_type === 'totp'),
    },
    {
      id: 'email',
      name: 'Código por Email',
      description: 'Receba códigos de verificação no seu email',
      icon: Mail,
      enabled: false,
      recommended: false,
      factors: [],
      comingSoon: true,
    },
    {
      id: 'recovery',
      name: 'Códigos de Recuperação',
      description: 'Códigos de backup para usar quando não tiver acesso a outros métodos',
      icon: Key,
      enabled: false,
      recommended: false,
      factors: [],
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Passkeys / Biometric Login */}
      <PasskeySettings />

      {/* MFA Status Card */}
      <Card className={isMFAEnabled ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isMFAEnabled ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
              {isMFAEnabled ? (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              ) : (
                <ShieldOff className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Autenticação Multi-Fator (MFA)
                <Badge variant={isMFAEnabled ? 'default' : 'secondary'}>
                  {isMFAEnabled ? 'Ativado' : 'Desativado'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMFAEnabled ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-600">MFA está ativado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua conta está protegida com autenticação de dois fatores. Você tem {verifiedFactors.length} método(s) ativo(s).
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600">MFA não está ativado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua conta está protegida apenas por senha. Ative a autenticação de dois fatores para maior segurança.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MFA Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Autenticação</CardTitle>
          <CardDescription>
            Escolha um ou mais métodos para proteger sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mfaMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border ${
                  method.recommended && !method.enabled ? 'border-primary/30 bg-primary/5' : 'bg-card'
                } ${method.enabled ? 'border-green-500/30 bg-green-500/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${method.enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                      <method.icon className={`h-5 w-5 ${method.enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.recommended && !method.enabled && (
                          <Badge variant="default" className="text-xs">Recomendado</Badge>
                        )}
                        {method.enabled && (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                            Ativado
                          </Badge>
                        )}
                        {method.comingSoon && (
                          <Badge variant="secondary" className="text-xs">Em breve</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </div>
                  
                  {method.id === 'totp' && (
                    <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant={method.enabled ? 'outline' : 'default'}
                          size="sm"
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {method.enabled ? 'Adicionar outro' : 'Ativar'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
                        <MFAEnroll 
                          onSuccess={handleEnrollSuccess}
                          onCancel={() => setEnrollDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {method.comingSoon && (
                    <Button variant="outline" size="sm" disabled>
                      Em breve
                    </Button>
                  )}
                </div>

                {/* List active TOTP factors */}
                {method.id === 'totp' && method.factors.length > 0 && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground">Dispositivos cadastrados:</p>
                    {method.factors.map((factor: any) => (
                      <div key={factor.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{factor.friendly_name || 'Autenticador'}</span>
                          <span className="text-xs text-muted-foreground">
                            Adicionado em {new Date(factor.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleUnenroll(factor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Como configurar o MFA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</span>
              <span>Baixe um aplicativo autenticador como Google Authenticator, Authy ou Microsoft Authenticator</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</span>
              <span>Clique em "Ativar" no método "Aplicativo Autenticador (TOTP)"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</span>
              <span>Escaneie o QR code com o aplicativo autenticador</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</span>
              <span>Digite o código de 6 dígitos gerado pelo aplicativo para confirmar a configuração</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">5</span>
              <span>Pronto! A partir de agora, você precisará do código do aplicativo para fazer login</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
