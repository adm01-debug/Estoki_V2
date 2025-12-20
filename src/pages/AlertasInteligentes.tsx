import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Loader2 } from "lucide-react";

// Simplified placeholder - full implementation pending hook updates
export default function AlertasInteligentesPage() {
  return (
    <AppLayout title="Alertas Inteligentes" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sistema de alertas inteligentes em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
