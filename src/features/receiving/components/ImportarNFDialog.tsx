import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Check, AlertTriangle, Package, Building2, Truck } from "lucide-react";
import { toast } from "sonner";
import { parseNFeXML, NFeParsed, validateNFeXML } from "@/utils/parseNFXML";
import { useRecebimentos } from "../hooks/useRecebimentos";
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

    if (!file.name.toLowerCase().endsWith(".xml")) {
      setError("Por favor, selecione um arquivo XML");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const validation = validateNFeXML(text);

      if (!validation.valid) {
        setError(validation.error || "XML inválido");
        setNfeData(null);
        return;
      }

      const parsed = parseNFeXML(text);
      setNfeData(parsed);
      toast.success("NF-e carregada com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar XML");
      setNfeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!nfeData) return;

    setLoading(true);
    try {
      // 1. Salvar documento NF-e (usando nomes de colunas em inglês conforme o schema existente)
      const { data: doc, error: docError } = await supabase
        .from("nfe_documents")
        .insert([
          {
            access_key: nfeData.chaveAcesso,
            number: parseInt(nfeData.numero),
            series: parseInt(nfeData.serie),
            issue_date: nfeData.dataEmissao.toISOString(),
            emitter_cnpj: nfeData.emitente.cnpj,
            emitter_name: nfeData.emitente.razaoSocial,
            total_nfe: nfeData.totais.valorTotal,
            xml_content: "",
            status: "imported",
          },
        ])
        .select()
        .single();

      if (docError) throw docError;

      // 2. Criar recebimentos e itens da NF
      for (const produto of nfeData.produtos) {
        const { data: prodData } = await supabase
          .from("produtos")
          .select("id")
          .or(`sku.eq.${produto.codigo},sku.eq.${produto.ean}`)
          .maybeSingle();

        await supabase.from("nfe_items").insert([
          {
            nfe_id: doc.id,
            product_code: produto.codigo,
            description: produto.descricao,
            quantity: produto.quantidade,
            unit_price: produto.valorUnitario,
            total: produto.valorTotal,
          },
        ]);

        // Criar lote de recebimento
        await createRecebimento.mutateAsync({
          numero_lote: `${nfeData.numero}-${produto.codigo}`,
          fornecedor: nfeData.emitente.razaoSocial,
          quantidade: Math.round(produto.quantidade),
          quantidade_pedida: Math.round(produto.quantidade),
          nf_entrada: nfeData.numero,
          produto_id: prodData?.id || null,
          status: "recebido",
        });
      }

      toast.success(`${nfeData.produtos.length} itens da NF-e nº ${nfeData.numero} importados!`);
      setOpen(false);
      setNfeData(null);
      onSuccess?.();
    } catch (err) {
      toast.error(
        "Erro ao importar NF-e: " + (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNfeData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar NF-e
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Nota Fiscal Eletrônica (XML)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!nfeData ? (
            <div className="space-y-4">
              <div
                className="group cursor-pointer rounded-3xl border-4 border-dashed border-primary/20 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <Label htmlFor="nf-file" className="cursor-pointer">
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    Importação Inteligente de NF-e
                  </span>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Arraste o XML da nota ou clique para selecionar. O sistema extrairá
                    automaticamente fornecedor, produtos, quantidades e impostos.
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
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="py-4 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">NF-e Nº {nfeData.numero}</h3>
                        <p className="text-sm text-muted-foreground">
                          Série {nfeData.serie} • {nfeData.dataEmissao.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        <Check className="mr-1 h-3 w-3" />
                        XML Válido
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-1 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Emitente</p>
                          <p>{nfeData.emitente.razaoSocial}</p>
                          <p className="text-muted-foreground">
                            CNPJ: {formatCNPJ(nfeData.emitente.cnpj)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Truck className="mt-1 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Transporte</p>
                          <p>{nfeData.transporte.transportadora?.razaoSocial || "Não informado"}</p>
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
                    <div className="mb-4 flex items-center gap-2">
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
                            <TableCell className="text-right">
                              {formatCurrency(produto.valorUnitario)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(produto.valorTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 flex justify-end border-t pt-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor Total da NF</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(nfeData.totais.valorTotal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {nfeData.informacoesComplementares && (
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="mb-2 font-semibold">Informações Complementares</h3>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
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
                {loading ? "Importando..." : `Importar ${nfeData.produtos.length} itens`}
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
