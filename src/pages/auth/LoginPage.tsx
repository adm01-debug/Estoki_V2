import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { authService } from '@/services/authService';
import { useLoginLockout } from '@/hooks/useLoginLockout';
import { toast } from 'sonner';
import { AlertTriangle, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    isLocked,
    attemptsCount,
    secondsRemaining,
    checkLockout,
    recordFailedAttempt,
    resetLockout,
    formatTimeRemaining,
  } = useLoginLockout();

  // Verifica bloqueio quando email muda
  useEffect(() => {
    if (email && email.includes('@')) {
      const timeout = setTimeout(() => {
        checkLockout(email);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [email, checkLockout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar bloqueio antes de tentar login
    const locked = await checkLockout(email);
    if (locked) {
      toast.error('Conta temporariamente bloqueada. Aguarde o tempo indicado.');
      return;
    }

    setLoading(true);
    try {
      await authService.signIn(email, password);
      // Login bem-sucedido - resetar tentativas
      await resetLockout(email);
      toast.success('Login realizado!');
      navigate('/dashboard');
    } catch (error: unknown) {
      // Registrar tentativa falhada
      await recordFailedAttempt(email);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const remainingAttempts = Math.max(0, 5 - attemptsCount);
  const showWarning = attemptsCount >= 3 && attemptsCount < 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ESTOKI</CardTitle>
          <p className="text-muted-foreground">Sistema de Gestão de Estoque</p>
        </CardHeader>
        <CardContent>
          {/* Aviso de bloqueio */}
          {isLocked && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in-50">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Conta temporariamente bloqueada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Muitas tentativas de login falhadas. Tente novamente em:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-destructive" />
                    <span className="text-lg font-mono font-bold text-destructive">
                      {formatTimeRemaining(secondsRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de tentativas restantes */}
          {showWarning && !isLocked && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-in fade-in-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Atenção: {remainingAttempts} tentativa{remainingAttempts !== 1 ? 's' : ''} restante{remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" aria-label="Formulário de login">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                autoComplete="email"
                disabled={isLocked}
              />
            </div>
            <PasswordInput
              id="password"
              label="Senha"
              value={password}
              onChange={setPassword}
              showStrength={false}
              checkBreached={false}
              disabled={isLocked}
            />
            <Button 
              type="submit" 
              className={cn("w-full", isLocked && "opacity-50")} 
              disabled={loading || isLocked}
              aria-busy={loading}
            >
              {loading ? 'Entrando...' : isLocked ? 'Conta Bloqueada' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
