import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Lock, 
  CheckCircle2, 
  Settings2,
  ArrowRight
} from "lucide-react";

const ROLES = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema, configurações e gestão de usuários.",
    users: 2,
    color: "bg-red-500",
    permissions: ["all:all"]
  },
  {
    id: "supervisor",
    name: "Supervisor",
    description: "Gestão operacional, relatórios e aprovação de movimentações.",
    users: 5,
    color: "bg-blue-500",
    permissions: ["wms:read", "wms:write", "reports:all"]
  },
  {
    id: "operador",
    name: "Operador",
    description: "Execução de tarefas de triagem, picking e conferência.",
    users: 15,
    color: "bg-slate-500",
    permissions: ["wms:read", "tasks:execute"]
  }
];

export default function RolesPage() {
  return (
    <AppLayout title="Níveis de Acesso" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((role) => (
              <Card key={role.id} className="relative overflow-hidden border-sidebar-border/50">
                <div className={`h-1.5 w-full ${role.color}`} />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-sidebar-accent/50">
                      <Shield className={`h-5 w-5 ${role.id === 'admin' ? 'text-red-500' : 'text-primary'}`} />
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> {role.users} usuários
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3 w-3" /> Permissões Principais
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px] lowercase font-mono">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-sidebar-border/50">
                    <Button variant="ghost" className="w-full justify-between text-xs group" size="sm">
                      Ver permissões detalhadas
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-sidebar-accent/20 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Precisa de um cargo personalizado?</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Crie novos níveis de acesso com permissões granulares para atender às necessidades específicas da sua operação.
              </p>
              <Button variant="outline" className="gap-2">
                Criar Novo Cargo
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
