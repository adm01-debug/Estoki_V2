import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isPasswordStrong = () => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!isPasswordStrong()) {
      toast.error('A senha não atende aos requisitos mínimos');
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email, password, { nome });
      toast.success('Conta criada com sucesso!');
      navigate('/login');
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : String(error)) || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <p className="text-muted-foreground">ESTOKI</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4" aria-label="Formulário de cadastro">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                aria-required="true"
                autoComplete="name"
              />
            </div>
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
              />
            </div>
            <PasswordInput
              id="password"
              label="Senha"
              value={password}
              onChange={setPassword}
              showStrength={true}
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirmar Senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showStrength={false}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive" role="alert">As senhas não conferem</p>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isPasswordStrong() || password !== confirmPassword}
              aria-busy={loading}
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}