import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface CEPInputProps { value?: string; onChange?: (value: string) => void; onAddressFound?: (address: { logradouro: string; bairro: string; cidade: string; uf: string }) => void; label?: string; }
export function CEPInput({ value = '', onChange, onAddressFound, label }: CEPInputProps) {
  const [loading, setLoading] = React.useState(false);
  const formatCEP = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    onChange?.(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8 && onAddressFound) {
      setLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) onAddressFound({ logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative"><Input value={value} onChange={handleChange} placeholder="00000-000" />{loading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}</div>
    </div>
  );
}
