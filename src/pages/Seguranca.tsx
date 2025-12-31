import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Monitor, Key, Bell, Lock, AlertTriangle } from 'lucide-react';
import { SecurityOverview } from '@/components/security/SecurityOverview';
import { ActiveSessions } from '@/components/security/ActiveSessions';
import { DeviceManagement } from '@/components/security/DeviceManagement';
import { SecurityAlerts } from '@/components/security/SecurityAlerts';
import { MFASettings } from '@/components/security/MFASettings';
import { AccessControl } from '@/components/security/AccessControl';

const Seguranca: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Segurança | WMS</title>
        <meta name="description" content="Painel de segurança unificado - gerencie sessões, dispositivos, MFA e alertas" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Segurança</h1>
            <p className="text-muted-foreground">Gerencie todas as configurações de segurança da sua conta</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Sessões</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Dispositivos</span>
            </TabsTrigger>
            <TabsTrigger value="mfa" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">MFA</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Acessos</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <SecurityOverview />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <ActiveSessions />
          </TabsContent>

          <TabsContent value="devices" className="mt-6">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="mfa" className="mt-6">
            <MFASettings />
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <AccessControl />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <SecurityAlerts />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Seguranca;
