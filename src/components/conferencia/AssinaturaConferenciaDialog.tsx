import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssinaturaDigital } from './AssinaturaDigital';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PenLine, Check, Upload } from 'lucide-react';

interface AssinaturaConferenciaDialogProps {
  recebimentoId: string;
  onSuccess?: (assinaturaUrl: string) => void;
  trigger?: React.ReactNode;
  assinaturaExistente?: string;
}

export function AssinaturaConferenciaDialog({
  recebimentoId,
  onSuccess,
  trigger,
  assinaturaExistente
}: AssinaturaConferenciaDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveAssinatura = async (assinaturaBase64: string) => {
    setLoading(true);
    
    try {
      // Converter base64 para blob
      const response = await fetch(assinaturaBase64);
      const blob = await response.blob();
      
      // Gerar nome único para o arquivo
      const fileName = `assinaturas/${recebimentoId}_${Date.now()}.png`;
      
      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('triagem-fotos')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('triagem-fotos')
        .getPublicUrl(fileName);

      const assinaturaUrl = urlData.publicUrl;

      // Atualizar o registro com a URL da assinatura
      // Como a coluna assinatura_url está em comprovantes_entrega, verificamos se existe relação
      // Para lotes, podemos armazenar em observacoes_conferencia ou criar um registro separado
      const { error: updateError } = await supabase
        .from('lotes')
        .update({
          observacoes_conferencia: `Assinatura digital registrada: ${assinaturaUrl}`,
          data_conferencia: new Date().toISOString(),
        })
        .eq('id', recebimentoId);

      if (updateError) {
        if (import.meta.env.DEV) console.warn('Aviso ao atualizar lote:', updateError);
      }

      toast.success('Assinatura registrada com sucesso!');
      setOpen(false);
      onSuccess?.(assinaturaUrl);
      
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast.error('Erro ao salvar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (assinaturaExistente) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Check className="h-3 w-3 mr-1" />
          Assinado
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(assinaturaExistente, '_blank')}
        >
          Ver assinatura
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <PenLine className="h-4 w-4 mr-2" />
            Assinar Conferência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Assinatura Digital
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="h-8 w-8 animate-pulse text-primary mb-4" />
            <p className="text-muted-foreground">Salvando assinatura...</p>
          </div>
        ) : (
          <AssinaturaDigital
            onSave={handleSaveAssinatura}
            onCancel={() => setOpen(false)}
            label="Assine para confirmar a conferência"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
