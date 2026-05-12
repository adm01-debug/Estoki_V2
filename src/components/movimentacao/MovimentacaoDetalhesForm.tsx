import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MovimentacaoDetalhesFormProps {
   formData: {
     localizacao: string;
     localizacao_origem?: string;
    quantidade: number;
    descricao: string;
  };
  setFormData: (fn: (prev: any) => any) => void;
  formErrors: Record<string, string>;
  setFormErrors: (fn: (prev: any) => any) => void;
}

 export function MovimentacaoDetalhesForm({ formData, setFormData, formErrors, setFormErrors, tipoMovimento }: MovimentacaoDetalhesFormProps & { tipoMovimento?: string }) {
   const isTransfer = tipoMovimento === "transferencia" || tipoMovimento === "armazenamento";

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <Label className="text-sm font-medium mb-3 block">📍 DETALHES</Label>
      <div className="space-y-3">
         {isTransfer && (
           <div>
             <Label htmlFor="localizacao_origem" className="text-xs text-muted-foreground">Localização Origem</Label>
             <Input 
               id="localizacao_origem"
               placeholder="De onde está saindo?"
               value={formData.localizacao_origem || ""}
               onChange={(e) => { 
                 setFormData(prev => ({ ...prev, localizacao_origem: e.target.value })); 
               }}
               className={formErrors.localizacao_origem ? "border-destructive" : ""}
             />
           </div>
         )}

        <div>
           <Label htmlFor="localizacao" className="text-xs text-muted-foreground">
             {isTransfer ? "Localização Destino" : "Localização"}
           </Label>
          <Input 
            id="localizacao"
            placeholder="Ex: PP1-S05-N2, BOX-12"
            value={formData.localizacao}
            onChange={(e) => { 
              setFormData(prev => ({ ...prev, localizacao: e.target.value })); 
              setFormErrors(prev => ({ ...prev, localizacao: "" })); 
            }}
            className={formErrors.localizacao ? "border-destructive" : ""}
            maxLength={50}
          />
          {formErrors.localizacao && <p className="text-xs text-destructive mt-1">{formErrors.localizacao}</p>}
        </div>

        <div>
          <Label htmlFor="quantidade" className="text-xs text-muted-foreground">Quantidade *</Label>
          <Input 
            id="quantidade"
            type="number" 
            min={1}
            value={formData.quantidade}
            onChange={(e) => { 
              setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 })); 
              setFormErrors(prev => ({ ...prev, quantidade: "" })); 
            }}
            className={formErrors.quantidade ? "border-destructive" : ""}
          />
          {formErrors.quantidade && <p className="text-xs text-destructive mt-1">{formErrors.quantidade}</p>}
        </div>

        <div>
          <Label htmlFor="descricao" className="text-xs text-muted-foreground">Descrição *</Label>
          <Textarea 
            id="descricao"
            placeholder="Descreva a movimentação (mín. 3 caracteres)..."
            value={formData.descricao}
            onChange={(e) => { 
              setFormData(prev => ({ ...prev, descricao: e.target.value })); 
              setFormErrors(prev => ({ ...prev, descricao: "" })); 
            }}
            className={formErrors.descricao ? "border-destructive" : ""}
            maxLength={500}
          />
          {formErrors.descricao && <p className="text-xs text-destructive mt-1">{formErrors.descricao}</p>}
        </div>
      </div>
    </div>
  );
}
