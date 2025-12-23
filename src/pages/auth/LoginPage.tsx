import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await authService.signIn(email, password); toast.success('Login realizado!'); navigate('/dashboard'); }
    catch (error: any) { toast.error(error.message || 'Erro ao fazer login'); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md"><CardHeader className="text-center"><CardTitle className="text-2xl">Estoki WMS</CardTitle><p className="text-muted-foreground">Sistema de Gestão de Estoque</p></CardHeader>
        <CardContent><form onSubmit={handleLogin} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div><Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button></form></CardContent>
      </Card>
    </div>
  );
}
