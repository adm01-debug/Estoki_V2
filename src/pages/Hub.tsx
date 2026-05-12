 import { AppLayout } from "@/components/layout/AppLayout";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Globe, RefreshCw, Link2, ShieldCheck, Database, Server } from "lucide-react";
 import { useState } from "react";
 import { toast } from "sonner";
 
 export default function HubPage() {
   const [syncing, setSyncing] = useState(false);
 
   const projects = [
     { id: 1, name: "Unidade São Paulo - Matriz", status: "online", lastSync: "2 min atrás", type: "WMS Central" },
     { id: 2, name: "Unidade Curitiba - Filial 01", status: "online", lastSync: "15 min atrás", type: "Cross-docking" },
     { id: 3, name: "Unidade Rio de Janeiro - Filial 02", status: "syncing", lastSync: "Agora", type: "Full WMS" },
     { id: 4, name: "CD Nordeste - Pernambuco", status: "online", lastSync: "1h atrás", type: "Distribuição" },
     { id: 5, name: "Unidade Porto Alegre - Filial 03", status: "offline", lastSync: "2 dias atrás", type: "Expedição" },
     { id: 6, name: "CD Centro-Oeste - Goiás", status: "online", lastSync: "5 min atrás", type: "Armazenagem" },
     { id: 7, name: "Unidade Belo Horizonte - Filial 04", status: "online", lastSync: "10 min atrás", type: "Picking Center" },
   ];
 
   const handleSync = () => {
     setSyncing(true);
     setTimeout(() => {
       setSyncing(false);
       toast.success("Sincronização global concluída entre todos os 7 projetos!");
     }, 2000);
   };
 
   return (
     <AppLayout title="Hub de Integração" showBack>
       <div className="p-4 space-y-6">
         <div className="flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold tracking-tight">Estoki Hub Central</h2>
             <p className="text-muted-foreground text-sm">Gerencie a comunicação e sincronização de dados entre unidades.</p>
           </div>
           <Button onClick={handleSync} disabled={syncing} className="gap-2">
             <RefreshCw className={syncing ? "animate-spin h-4 w-4" : "h-4 w-4"} />
             Sincronizar Tudo
           </Button>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="bg-primary/5 border-primary/20">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <Database className="h-4 w-4 text-primary" /> Compartilhamento de Dados
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">Ativo</div>
               <p className="text-[10px] text-muted-foreground mt-1">Estoque global sincronizado em tempo real.</p>
             </CardContent>
           </Card>
           <Card className="bg-green-500/5 border-green-500/20">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-green-600" /> Autenticação Unificada
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">SSO Ativo</div>
               <p className="text-[10px] text-muted-foreground mt-1">Mesmo login para todas as unidades do grupo.</p>
             </CardContent>
           </Card>
           <Card className="bg-blue-500/5 border-blue-500/20">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <Globe className="h-4 w-4 text-blue-600" /> Endpoints de Rede
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">14/14</div>
               <p className="text-[10px] text-muted-foreground mt-1">Rotas de comunicação bidirecional operacionais.</p>
             </CardContent>
           </Card>
         </div>
 
         <div className="space-y-3">
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <Link2 className="h-5 w-5 text-primary" /> Unidades Conectadas
           </h3>
           <div className="grid grid-cols-1 gap-3">
             {projects.map((proj) => (
               <Card key={proj.id} className="hover:border-primary/30 transition-colors">
                 <CardContent className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${proj.status === 'online' ? 'bg-green-100' : proj.status === 'syncing' ? 'bg-blue-100' : 'bg-red-100'}`}>
                       <Server className={`h-5 w-5 ${proj.status === 'online' ? 'text-green-600' : proj.status === 'syncing' ? 'text-blue-600' : 'text-red-600'}`} />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h4 className="font-semibold text-sm">{proj.name}</h4>
                         <Badge variant="outline" className="text-[10px] py-0">{proj.type}</Badge>
                       </div>
                       <p className="text-xs text-muted-foreground">Último Sync: {proj.lastSync}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Badge variant={proj.status === 'online' ? 'default' : proj.status === 'syncing' ? 'secondary' : 'destructive'} className="uppercase text-[9px]">
                       {proj.status}
                     </Badge>
                     <Button variant="ghost" size="sm" className="h-8 px-2">Configurar</Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </div>
     </AppLayout>
   );
 }