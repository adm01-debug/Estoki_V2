import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Check, AlertTriangle, Package, Building2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { parseNFeXML, NFeParsed, validateNFeXML } from '@/utils/parseNFXML';
import { useRecebimentos } from '@/hooks/useRecebimentos';
// @ts-nocheck
interface ImportarNFDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ImportarNFDialog({ trigger, onSuccess }: ImportarNFDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nfeData, setNfeData] = useState<NFeParsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createRecebimento } = useRecebimentos();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      setError('Por favor, selecione um arquivo XML');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const validation = validateNFeXML(text);
      
      if (!validation.valid) {
        setError(validation.error || 'XML inválido');
        setNfeData(null);
        return;
      }

      const parsed = parseNFeXML(text);
      setNfeData(parsed);
      toast.success('NF-e carregada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar XML');
      setNfeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!nfeData) return;

    setLoading(true);
    try {
      // Criar recebimentos para cada produto da NF
      // Nota: produto_id seria necessário - aqui usamos um placeholder
      // Em produção, seria necessário mapear o código do produto para o ID no banco
      for (const produto of nfeData.produtos) {
        await createRecebimento({
          numero_lote: `${nfeData.numero}-${produto.codigo}`,
          fornecedor: nfeData.emitente.razaoSocial,
          quantidade: Math.round(produto.quantidade),
          quantidade_pedida: Math.round(produto.quantidade),
          nf_entrada: nfeData.numero,
          produto_id: '', // Seria necessário buscar/criar o produto
          status: 'recebido',
        });
      }

      toast.success(`${nfeData.produtos.length} itens importados com sucesso!`);
      setOpen(false);
      setNfeData(null);
      onSuccess?.();
    } catch (err) {
      toast.error('Erro ao importar itens: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNfeData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar NF-e
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Nota Fiscal Eletrônica (XML)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!nfeData ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="nf-file" className="cursor-pointer">
                  <span className="text-lg font-medium">Clique para selecionar o arquivo XML</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suporta arquivos XML de NF-e no padrão brasileiro
                  </p>
                </Label>
                <Input
                  id="nf-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".xml"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-2 text-muted-foreground">Processando XML...</p>
                </div>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {/* Cabeçalho da NF */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">NF-e Nº {nfeData.numero}</h3>
                        <p className="text-sm text-muted-foreground">
                          Série {nfeData.serie} • {nfeData.dataEmissao.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        XML Válido
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Emitente</p>
                          <p>{nfeData.emitente.razaoSocial}</p>
                          <p className="text-muted-foreground">CNPJ: {formatCNPJ(nfeData.emitente.cnpj)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Truck className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Transporte</p>
                          <p>{nfeData.transporte.transportadora?.razaoSocial || 'Não informado'}</p>
                          {nfeData.transporte.volumes && (
                            <p className="text-muted-foreground">
                              {nfeData.transporte.volumes.quantidade} volume(s) • 
                              {nfeData.transporte.volumes.pesoBruto.toFixed(2)} kg
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Produtos */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-4 w-4" />
                      <h3 className="font-semibold">Produtos ({nfeData.produtos.length} itens)</h3>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nfeData.produtos.map((produto, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{produto.codigo}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={produto.descricao}>
                              {produto.descricao}
                            </TableCell>
                            <TableCell className="text-right">
                              {produto.quantidade} {produto.unidade}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(produto.valorUnitario)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(produto.valorTotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor Total da NF</p>
                        <p className="text-xl font-bold">{formatCurrency(nfeData.totais.valorTotal)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {nfeData.informacoesComplementares && (
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-2">Informações Complementares</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {nfeData.informacoesComplementares}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2">
          {nfeData ? (
            <>
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                Selecionar outro arquivo
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? 'Importando...' : `Importar ${nfeData.produtos.length} itens`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
