import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GeoWhitelistEntry {
  id: string;
  country_code: string;
  country_name: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export const AVAILABLE_COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'MX', name: 'México' },
  { code: 'PE', name: 'Peru' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'EC', name: 'Equador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'JP', name: 'Japão' },
  { code: 'CN', name: 'China' },
  { code: 'AU', name: 'Austrália' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'IN', name: 'Índia' },
  { code: 'RU', name: 'Rússia' },
  { code: 'KR', name: 'Coreia do Sul' },
];

export function useGeoWhitelist() {
  const [entries, setEntries] = useState<GeoWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('geo_whitelist')
      .select('*')
      .order('country_name');
    
    if (error) {
      toast.error('Erro ao carregar países permitidos');
      if (import.meta.env.DEV) console.error(error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addCountry = async (countryCode: string, countryName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('geo_whitelist')
      .insert({
        country_code: countryCode,
        country_name: countryName,
        created_by: user?.id
      });
    
    if (error) {
      if (error.code === '23505') {
        toast.error('Este país já está na lista');
      } else {
        toast.error('Erro ao adicionar país');
      }
      return false;
    }
    
    toast.success('País adicionado à whitelist');
    fetchEntries();
    return true;
  };

  const removeCountry = async (id: string) => {
    const { error } = await supabase
      .from('geo_whitelist')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Erro ao remover país');
      return false;
    }
    
    toast.success('País removido da whitelist');
    fetchEntries();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('geo_whitelist')
      .update({ is_active: isActive })
      .eq('id', id);
    
    if (error) {
      toast.error('Erro ao atualizar status');
      return false;
    }
    
    toast.success(isActive ? 'País ativado' : 'País desativado');
    fetchEntries();
    return true;
  };

  const getAvailableCountries = () => {
    const existingCodes = entries.map(e => e.country_code);
    return AVAILABLE_COUNTRIES.filter(c => !existingCodes.includes(c.code));
  };

  return {
    entries,
    loading,
    addCountry,
    removeCountry,
    toggleActive,
    getAvailableCountries,
    refresh: fetchEntries
  };
}
