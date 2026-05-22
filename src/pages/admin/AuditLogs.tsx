import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService, AuditFilter } from '@/services/auditService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Download, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuditLogs: React.FC = () => {
  const [filters, setFilters] = useState<AuditFilter>({
    page: 1,
    pageSize: 20
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getAll(filters),
  });

  const handleExport = async () => {
    try {
      const allLogs = await auditService.getAll({ ...filters, pageSize: 1000, page: 1 });
      const Papa = (await import('papaparse')).default;
      const csv = Papa.unparse(allLogs.data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      toast.success('Logs exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar logs');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por email..." 
                className="pl-8"
                onChange={(e) => setFilters(prev => ({ ...prev, user_email: e.target.value, page: 1 }))}
              />
            </div>
            <Select onValueChange={(val) => setFilters(prev => ({ ...prev, action: val === 'all' ? undefined : val, page: 1 }))}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => setFilters(prev => ({ ...prev, entity_type: val === 'all' ? undefined : val, page: 1 }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="product">Produtos</SelectItem>
                <SelectItem value="order">Pedidos</SelectItem>
                <SelectItem value="inventory">Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>ID Entidade</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                      <TableCell>{log.user_email}</TableCell>
                      <TableCell className="capitalize">{log.action}</TableCell>
                      <TableCell>{log.entity_type}</TableCell>
                      <TableCell className="font-mono text-xs">{log.entity_id}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Ver JSON</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Total: {data?.count || 0} registros
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={filters.page === 1 || isFetching}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-2 text-sm font-medium">
                Página {filters.page}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!data || data.data.length < (filters.pageSize || 20) || isFetching}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
