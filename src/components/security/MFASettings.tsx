import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Smartphone, Mail, Shield, ShieldOff, QrCode, Copy, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const MFASettings: React.FC = () => {
  const { user } = useAuth();

  const mfaMethods = [
    {
      id: 'totp',
      name: 'Aplicativo Autenticador',
      description: 'Use um aplicativo como Google Authenticator ou Authy para gerar códigos',
      icon: Smartphone,
      enabled: false,
      recommended: true,
    },
    {
      id: 'email',
      name: 'Código por Email',
      description: 'Receba códigos de verificação no seu email',
      icon: Mail,
      enabled: false,
      recommended: false,
    },
    {
      id: 'recovery',
      name: 'Códigos de Recuperação',
      description: 'Códigos de backup para usar quando não tiver acesso a outros métodos',
      icon: Key,
      enabled: false,
      recommended: false,
    },
  ];

  const handleEnableMFA = (methodId: string) => {
    toast.info('A funcionalidade de MFA será implementada em breve');
  };

  return (
    <div className="space-y-6">
      {/* MFA Status Card */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <ShieldOff className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Autenticação Multi-Fator (MFA)
                <Badge variant="secondary">Desativado</Badge>
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-600">MFA não está ativado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sua conta está protegida apenas por senha. Ative a autenticação de dois fatores para maior segurança.
              </p>
            </div>
          </div>
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
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  method.recommended ? 'border-primary/30 bg-primary/5' : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${method.enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                    <method.icon className={`h-5 w-5 ${method.enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      {method.recommended && (
                        <Badge variant="default" className="text-xs">Recomendado</Badge>
                      )}
                      {method.enabled && (
                        <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                          Ativado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  </div>
                </div>
                <Button
                  variant={method.enabled ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleEnableMFA(method.id)}
                >
                  {method.enabled ? 'Gerenciar' : 'Ativar'}
                </Button>
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
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Baixe um aplicativo autenticador como Google Authenticator, Authy ou Microsoft Authenticator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>Clique em "Ativar" no método "Aplicativo Autenticador"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Escaneie o QR code com o aplicativo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">4.</span>
              <span>Digite o código de 6 dígitos para confirmar a configuração</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">5.</span>
              <span>Salve os códigos de recuperação em um local seguro</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
