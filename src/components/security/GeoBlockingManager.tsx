import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Globe, Shield, Loader2 } from 'lucide-react';
import { useGeoWhitelist } from '@/hooks/useGeoWhitelist';
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

export function GeoBlockingManager() {
  const { entries, loading, addCountry, removeCountry, toggleActive, getAvailableCountries } = useGeoWhitelist();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [adding, setAdding] = useState(false);

  const availableCountries = getAvailableCountries();

  const handleAddCountry = async () => {
    if (!selectedCountry) return;
    
    const country = availableCountries.find(c => c.code === selectedCountry);
    if (!country) return;

    setAdding(true);
    await addCountry(country.code, country.name);
    setSelectedCountry('');
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    await removeCountry(id);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleActive(id, !current);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Bloqueio Geográfico</CardTitle>
          </div>
          <CardDescription>
            Configure quais países podem acessar o sistema. Apenas usuários de países na whitelist terão acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium">Whitelist Ativa</p>
              <p className="text-sm text-muted-foreground">
                {entries.filter(e => e.is_active).length} país(es) permitido(s)
              </p>
            </div>
          </div>

          {/* Add Country */}
          <div className="flex gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um país para adicionar" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddCountry} disabled={!selectedCountry || adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-2">Adicionar</span>
            </Button>
          </div>

          {/* Countries Table */}
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum país na whitelist</p>
              <p className="text-sm">Adicione países para permitir o acesso</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>País</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.country_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.country_code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_active ? 'default' : 'secondary'}>
                        {entry.is_active ? 'Permitido' : 'Bloqueado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={entry.is_active}
                        onCheckedChange={() => handleToggle(entry.id, entry.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover país?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {entry.country_name} da whitelist? 
                              Usuários deste país não poderão mais acessar o sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemove(entry.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
