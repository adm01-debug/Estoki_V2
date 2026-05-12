import { useState, useEffect } from 'react';
import { DataGrid } from '@/components/data/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { toast } from 'sonner';
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadProducts(); }, []);
  const loadProducts = async () => { try { const data = await productService.getAll(); setProducts(data); } catch (e) { toast.error('Erro ao carregar produtos'); } finally { setLoading(false); } };
  const columns = [
    { key: 'sku' as const, header: 'SKU' }, 
    { key: 'nome' as const, header: 'Nome' }, 
    { key: 'giro_mensal' as const, header: 'Giro' },
    { key: 'curva_abc' as const, header: 'Curva' }
  ];
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Produtos</h1><Button><Plus className="h-4 w-4 mr-2" />Novo Produto</Button></div>
      <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
      <DataGrid data={products} columns={columns} />
    </div>
  );
}
