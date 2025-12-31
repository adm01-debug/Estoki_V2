import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Plus, Trash2, Smartphone, Laptop, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PasskeySettings() {
  const { 
    loading, 
    passkeys, 
    isSupported, 
    checkSupport, 
    fetchPasskeys, 
    registerPasskey, 
    deletePasskey 
  } = useWebAuthn();

  const [deviceName, setDeviceName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkSupport();
    fetchPasskeys();
  }, [checkSupport, fetchPasskeys]);

  const handleRegister = async () => {
    const success = await registerPasskey(deviceName || undefined);
    if (success) {
      setDeviceName('');
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePasskey(id);
    setDeleteConfirm(null);
  };

  const getDeviceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('celular')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  if (isSupported === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Passkeys / Login Biométrico
          </CardTitle>
          <CardDescription>
            Use sua impressão digital ou reconhecimento facial para fazer login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Não suportado</p>
              <p className="text-sm text-muted-foreground">
                Seu navegador ou dispositivo não suporta autenticação biométrica (WebAuthn).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Passkeys / Login Biométrico
            </CardTitle>
            <CardDescription>
              Use sua impressão digital ou reconhecimento facial para fazer login de forma segura
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Passkey
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Passkey</DialogTitle>
                <DialogDescription>
                  Configure autenticação biométrica neste dispositivo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Nome do Dispositivo</Label>
                  <Input
                    id="deviceName"
                    placeholder="Ex: Meu Notebook, iPhone, etc"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha um nome para identificar este dispositivo
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Como funciona:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clique em "Registrar" abaixo</li>
                    <li>• Seu navegador solicitará autenticação biométrica</li>
                    <li>• Use sua impressão digital ou Face ID</li>
                    <li>• Pronto! Você poderá fazer login sem senha</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleRegister} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Registrar Passkey
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {passkeys.length === 0 ? (
          <div className="text-center py-8">
            <Fingerprint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma passkey registrada. Adicione uma para login mais rápido e seguro.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getDeviceIcon(passkey.device_name)}
                  </div>
                  <div>
                    <p className="font-medium">{passkey.device_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Registrado em {format(new Date(passkey.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      {passkey.last_used_at && (
                        <>
                          <span>•</span>
                          <span>
                            Último uso: {format(new Date(passkey.last_used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Ativo
                  </Badge>
                  {deleteConfirm === passkey.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(passkey.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(passkey.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
