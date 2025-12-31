import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPInput } from '@/components/forms/OTPInput';
import { useMFA } from '@/hooks/useMFA';
import { Shield, Copy, Check, Loader2, Smartphone, Key } from 'lucide-react';
import { toast } from 'sonner';

interface MFAEnrollProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MFAEnroll({ onSuccess, onCancel }: MFAEnrollProps) {
  const { loading, error, enrollmentData, startEnrollment, verifyEnrollment, cancelEnrollment, clearError } = useMFA();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'start' | 'scan' | 'verify'>('start');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (enrollmentData && step !== 'verify') {
        cancelEnrollment();
      }
    };
  }, []);

  const handleStart = async () => {
    clearError();
    const result = await startEnrollment();
    if (result) {
      setStep('scan');
    }
  };

  const handleCopySecret = async () => {
    if (enrollmentData?.secret) {
      await navigator.clipboard.writeText(enrollmentData.secret);
      setCopied(true);
      toast.success('Chave copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (!enrollmentData?.factorId || code.length !== 6) return;
    
    const success = await verifyEnrollment(enrollmentData.factorId, code);
    if (success) {
      toast.success('2FA ativado com sucesso!');
      onSuccess?.();
    }
  };

  const handleCancel = () => {
    cancelEnrollment();
    setStep('start');
    setCode('');
    onCancel?.();
  };

  if (step === 'start') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Ativar Autenticação 2FA</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Aplicativos compatíveis:</p>
                <p className="text-muted-foreground">Google Authenticator, Microsoft Authenticator, Authy, 1Password</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Como funciona:</p>
                <p className="text-muted-foreground">Você escaneará um QR code e digitará um código de 6 dígitos para confirmar</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button onClick={handleStart} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Começar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'scan') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Escaneie o QR Code</CardTitle>
          <CardDescription>
            Use seu aplicativo autenticador para escanear o código abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrollmentData?.qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img 
                src={enrollmentData.qrCode} 
                alt="QR Code para 2FA" 
                className="w-48 h-48"
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Ou insira a chave manualmente:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 text-xs bg-muted rounded font-mono break-all">
                {enrollmentData?.secret}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopySecret}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={() => setStep('verify')} className="flex-1">
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Verificar Código</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <OTPInput 
            length={6} 
            value={code} 
            onChange={setCode}
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('scan')} className="flex-1">
            Voltar
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={loading || code.length !== 6}
            className="flex-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ativar 2FA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
