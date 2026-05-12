 import { useState } from "react";
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Upload, Download, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
 import { toast } from "sonner";
 import { useProdutos } from "@/hooks/useProdutos";
 
 export function BulkImportDialog() {
   const [file, setFile] = useState<File | null>(null);
   const [importing, setImporting] = useState(false);
   const { bulkCreateProdutos } = useProdutos();
   const [open, setOpen] = useState(false);
 
   const handleDownloadTemplate = () => {
     const headers = "sku,nome,descricao,unidade,estoque_minimo,estoque_maximo,ponto_pedido,peso_unitario,fornecedor_principal\n";
     const example = "SKU001,Produto Exemplo,Descrição do produto,UN,10,100,20,1.5,Fornecedor A\n";
     const blob = new Blob([headers + example], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = "template_importacao_produtos.csv";
     a.click();
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       const selectedFile = e.target.files[0];
       if (!selectedFile.name.endsWith('.csv')) {
         toast.error("Por favor, selecione um arquivo CSV.");
         return;
       }
       setFile(selectedFile);
     }
   };
 
   const handleImport = async () => {
     if (!file) return;
     setImporting(true);
     
     try {
       const text = await file.text();
       const lines = text.split('\n');
       const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
       
       const data = lines.slice(1).filter(l => l.trim()).map(line => {
         const values = line.split(',');
         const obj: any = {};
         headers.forEach((header, index) => {
           let val: any = values[index]?.trim();
           if (['estoque_minimo', 'estoque_maximo', 'ponto_pedido', 'peso_unitario'].includes(header)) {
             val = val ? parseFloat(val) : 0;
           }
           obj[header] = val;
         });
         return obj;
       });
 
       if (data.length === 0) throw new Error("Arquivo vazio ou sem dados válidos.");
       
       await bulkCreateProdutos.mutateAsync(data);
       setOpen(false);
       setFile(null);
     } catch (error: any) {
       toast.error(error.message || "Erro ao processar arquivo CSV");
     } finally {
       setImporting(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         <Button variant="outline" size="sm" className="gap-2">
           <Upload className="h-4 w-4" />
           <span className="hidden sm:inline">Importar CSV</span>
         </Button>
       </DialogTrigger>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>Importar Produtos</DialogTitle>
           <DialogDescription>
             Faça o upload de um arquivo CSV para cadastrar múltiplos produtos de uma vez.
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-6 py-4">
           <div className="flex flex-col gap-2">
             <Label>1. Baixe o modelo</Label>
             <Button variant="secondary" onClick={handleDownloadTemplate} className="w-full gap-2">
               <Download className="h-4 w-4" /> Template CSV
             </Button>
           </div>
           
           <div className="flex flex-col gap-2">
             <Label htmlFor="csv-upload">2. Selecione o arquivo</Label>
             <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative">
               <input 
                 id="csv-upload"
                 type="file" 
                 accept=".csv" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleFileChange}
               />
               {file ? (
                 <>
                   <CheckCircle2 className="h-8 w-8 text-success" />
                   <span className="text-sm font-medium">{file.name}</span>
                   <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Trocar arquivo</Button>
                 </>
               ) : (
                 <>
                   <FileText className="h-8 w-8 text-muted-foreground" />
                   <span className="text-sm text-muted-foreground text-center">Clique ou arraste o arquivo CSV aqui</span>
                 </>
               )}
             </div>
           </div>
 
           <div className="bg-muted p-3 rounded-lg flex gap-3">
             <AlertCircle className="h-5 w-5 text-primary shrink-0" />
             <p className="text-[11px] text-muted-foreground">
               O arquivo deve seguir exatamente as colunas do modelo. Certifique-se de que os SKUs sejam únicos para evitar duplicidade.
             </p>
           </div>
         </div>
 
         <div className="flex justify-end gap-2">
           <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
           <Button 
             onClick={handleImport} 
             disabled={!file || importing} 
             className="gap-2"
           >
             {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
             {importing ? "Importando..." : "Confirmar Importação"}
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }