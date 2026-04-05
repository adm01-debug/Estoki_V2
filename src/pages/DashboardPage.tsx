import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/display/StatCard';
import { Package, MapPin, TrendingUp, AlertTriangle, Truck, ClipboardCheck } from 'lucide-react';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, lowStock: 0, pendingOrders: 0, todayMovements: 0 });
  useEffect(() => { loadStats(); }, []);
  const loadStats = async () => {
    try {
      const products = await productService.getAll();
      const lowStock = products.filter(p => p.stock_quantity <= p.reorder_point);
      const orders = await orderService.getAll('sales', 'pending');
      setStats({ products: products.length, lowStock: lowStock.length, pendingOrders: orders.length, todayMovements: 0 });
    } catch (e) { if (import.meta.env.DEV) console.error(e); }
  };
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Produtos" value={stats.products} icon={<Package className="h-4 w-4" />} />
        <StatCard title="Estoque Baixo" value={stats.lowStock} icon={<AlertTriangle className="h-4 w-4" />} trend={stats.lowStock > 0 ? 'down' : 'neutral'} />
        <StatCard title="Pedidos Pendentes" value={stats.pendingOrders} icon={<Truck className="h-4 w-4" />} />
        <StatCard title="Movimentações Hoje" value={stats.todayMovements} icon={<TrendingUp className="h-4 w-4" />} />
      </div>
    </div>
  );
}
