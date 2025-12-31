import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPInput } from '@/components/forms/OTPInput';
import { useMFA } from '@/hooks/useMFA';
import { Shield, Loader2 } from 'lucide-react';

interface MFAVerifyProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  factorId?: string;
}

export function MFAVerify({ onSuccess, onCancel, factorId: propFactorId }: MFAVerifyProps) {
  const { loading, error, factors, listFactors, verifyLogin, clearError } = useMFA();
  const [code, setCode] = useState('');
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(propFactorId || null);

  useEffect(() => {
    if (!propFactorId) {
      loadFactors();
    }
  }, [propFactorId]);

  const loadFactors = async () => {
    const allFactors = await listFactors();
    const verifiedFactors = allFactors.filter(f => f.status === 'verified');
    if (verifiedFactors.length > 0 && !selectedFactorId) {
      setSelectedFactorId(verifiedFactors[0].id);
    }
  };

  const handleVerify = async () => {
    if (!selectedFactorId || code.length !== 6) return;
    
    clearError();
    const result = await verifyLogin(selectedFactorId, code);
    if (result.success) {
      onSuccess?.();
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    clearError();
    
    // Auto-submit when 6 digits are entered
    if (newCode.length === 6 && selectedFactorId) {
      setTimeout(() => {
        handleVerify();
      }, 100);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
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
            onChange={handleCodeChange}
            autoFocus
          />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) para obter o código
        </p>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleVerify} 
            disabled={loading || code.length !== 6 || !selectedFactorId}
            className="flex-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Verificar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
