import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FotoTriagem {
  id: string;
  url: string;
  tipo: 'geral' | 'etiqueta' | 'detalhe' | 'defeito';
  timestamp: Date;
  uploading?: boolean;
}

interface UseTriagemFotosOptions {
  triagemId?: string;
}

export function useTriagemFotos(options: UseTriagemFotosOptions = {}) {
  const [fotos, setFotos] = useState<FotoTriagem[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadFoto = useCallback(async (
    file: File,
    tipo: FotoTriagem['tipo']
  ): Promise<FotoTriagem | null> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para fazer upload',
        variant: 'destructive',
      });
      return null;
    }

    const tempId = `temp-${Date.now()}`;
    const tempFoto: FotoTriagem = {
      id: tempId,
      url: URL.createObjectURL(file),
      tipo,
      timestamp: new Date(),
      uploading: true,
    };

    // Add temp foto to show immediately
    setFotos(prev => [...prev, tempFoto]);
    setUploading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${options.triagemId || 'novo'}/${Date.now()}-${tipo}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('triagem-fotos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('triagem-fotos')
        .getPublicUrl(data.path);

      const foto: FotoTriagem = {
        id: data.path,
        url: urlData.publicUrl,
        tipo,
        timestamp: new Date(),
        uploading: false,
      };

      // Replace temp foto with real one
      setFotos(prev => prev.map(f => f.id === tempId ? foto : f));

      return foto;
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      
      // Remove temp foto on error
      setFotos(prev => prev.filter(f => f.id !== tempId));
      
      toast({
        title: 'Erro no upload',
        description: err instanceof Error ? err.message : 'Falha ao enviar imagem',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [user, options.triagemId, toast]);

  const removeFoto = useCallback(async (fotoId: string) => {
    try {
      // Remove from storage
      const { error } = await supabase.storage
        .from('triagem-fotos')
        .remove([fotoId]);

      if (error) {
        if (import.meta.env.DEV) console.warn('Erro ao deletar do storage:', error);
      }

      // Remove from state
      setFotos(prev => prev.filter(f => f.id !== fotoId));
    } catch (err) {
      console.error('Erro ao remover foto:', err);
    }
  }, []);

  const addFotoFromFile = useCallback(async (
    file: File,
    tipo: FotoTriagem['tipo']
  ) => {
    return uploadFoto(file, tipo);
  }, [uploadFoto]);

  // Helper para verificar requisitos
  const temFotoGeral = fotos.some(f => f.tipo === 'geral' && !f.uploading);
  const temFotoEtiqueta = fotos.some(f => f.tipo === 'etiqueta' && !f.uploading);
  const requisitosAtendidos = temFotoGeral && temFotoEtiqueta;

  // Get all foto URLs for saving
  const getFotosUrls = useCallback((): string[] => {
    return fotos
      .filter(f => !f.uploading)
      .map(f => f.url);
  }, [fotos]);

  // Save fotos to triagem record
  const salvarFotosTriagem = useCallback(async (triagemId: string) => {
    const urls = getFotosUrls();
    
    if (urls.length === 0) return true;

    try {
      const { error } = await supabase
        .from('eventos_triagem')
        .update({ fotos: urls })
        .eq('id', triagemId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao salvar fotos na triagem:', err);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar fotos na triagem',
        variant: 'destructive',
      });
      return false;
    }
  }, [getFotosUrls, toast]);

  return {
    fotos,
    uploading,
    addFotoFromFile,
    removeFoto,
    temFotoGeral,
    temFotoEtiqueta,
    requisitosAtendidos,
    getFotosUrls,
    salvarFotosTriagem,
  };
}
