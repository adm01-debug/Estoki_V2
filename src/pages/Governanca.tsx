import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Link2, MapPin, AlertTriangle } from 'lucide-react';
import { CustodiaTab } from '@/components/governanca/CustodiaTab';
import { CheckpointsTab } from '@/components/governanca/CheckpointsTab';
import { OcorrenciasTab } from '@/components/governanca/OcorrenciasTab';

export default function Governanca() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          Governança & Responsabilização
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadeia de custódia, checkpoints obrigatórios e investigação de perdas — zero margem para "ninguém sabe onde está".
        </p>
      </div>

      <Tabs defaultValue="custodia" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="custodia" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Cadeia de Custódia</span>
            <span className="sm:hidden">Custódia</span>
          </TabsTrigger>
          <TabsTrigger value="checkpoints" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Checkpoints Zona</span>
            <span className="sm:hidden">Checkpoints</span>
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Ocorrências</span>
            <span className="sm:hidden">Ocorrências</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="custodia"><CustodiaTab /></TabsContent>
        <TabsContent value="checkpoints"><CheckpointsTab /></TabsContent>
        <TabsContent value="ocorrencias"><OcorrenciasTab /></TabsContent>
      </Tabs>
    </div>
  );
}
