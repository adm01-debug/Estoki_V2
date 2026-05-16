 import { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/contexts/AuthContext';
 import { AppLayout } from '@/components/layout/AppLayout';
 import { PageTransition } from '@/components/layout/PageTransition';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Badge } from '@/components/ui/badge';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { User, Mail, Shield, Save, Key, Clock, LogOut, Settings, Laptop, Globe, Calendar } from 'lucide-react';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 export default function ProfilePage() {
   const { profile, role, user, signOut } = useAuth();
   const [isEditing, setIsEditing] = useState(false);
   const [nome, setNome] = useState(profile?.nome || '');
 
   const activeSessions = [
     { device: "MacBook Pro - Chrome", location: "São Paulo, BR", lastActive: "Agora", ip: "189.122.XX.XX", isCurrent: true },
     { device: "iPhone 15 - Safari", location: "São Paulo, BR", lastActive: "2 horas atrás", ip: "177.34.XX.XX", isCurrent: false },
   ];
 
   const handleSave = () => {
     toast.success("Perfil atualizado com sucesso!");
     setIsEditing(false);
   };
 
   const initials = profile?.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
 
   return (
     <AppLayout title="Meu Perfil" showBack>
       <PageTransition>
         <div className="p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto">
           {/* Header do Perfil */}
           <div className="relative p-8 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden shadow-2xl shadow-primary/20">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
               <User className="h-48 w-48 text-white" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl ring-4 ring-white/10">
                 <AvatarImage src={user?.user_metadata?.avatar_url} />
                 <AvatarFallback className="bg-white/20 text-white text-4xl font-black">{initials}</AvatarFallback>
               </Avatar>
               <div className="text-center md:text-left space-y-2">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <h1 className="text-3xl font-black text-white tracking-tight">{profile?.nome || 'Usuário Estoki'}</h1>
                   <Badge className="bg-white/20 text-white border-white/30 font-black uppercase tracking-widest px-3">
                     {role === 'admin' ? 'Administrador' : role === 'supervisor' ? 'Supervisor' : 'Operador'}
                   </Badge>
                 </div>
                 <p className="text-white/70 font-medium flex items-center justify-center md:justify-start gap-2">
                   <Mail className="h-4 w-4" /> {user?.email}
                 </p>
               </div>
               <div className="md:ml-auto">
                 <Button 
                   variant="outline" 
                   className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl gap-2 font-black text-xs uppercase tracking-wider h-11"
                   onClick={() => setIsEditing(!isEditing)}
                 >
                   <Settings className="h-4 w-4" /> 
                   {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                 </Button>
               </div>
             </div>
           </div>
 
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Informações da Conta */}
             <div className="lg:col-span-2 space-y-6">
               <Card className="glass-card border-border/30 shadow-lg overflow-hidden">
                 <CardHeader className="border-b border-border/20 bg-muted/20">
                   <CardTitle className="text-lg font-black tracking-tight">Informações Básicas</CardTitle>
                   <CardDescription className="text-xs font-medium">Gerencie os dados visíveis do seu perfil profissional</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome Completo</Label>
                       <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input 
                           id="nome" 
                           disabled={!isEditing} 
                           value={nome} 
                           onChange={(e) => setNome(e.target.value)}
                           className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:bg-background transition-all font-bold"
                         />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail Corporativo</Label>
                       <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input 
                           id="email" 
                           disabled 
                           value={user?.email || ''} 
                           className="pl-10 h-11 rounded-xl bg-muted/20 border-border/20 opacity-70 font-bold"
                         />
                       </div>
                     </div>
                   </div>
 
                   {isEditing && (
                     <div className="flex justify-end pt-4">
                       <Button onClick={handleSave} className="glow-button gap-2 rounded-xl h-11 px-8 font-black text-xs uppercase tracking-wider">
                         <Save className="h-4 w-4" /> Salvar Alterações
                       </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
 
               <Card className="glass-card border-border/30 shadow-lg overflow-hidden">
                 <CardHeader className="border-b border-border/20 bg-muted/20">
                   <CardTitle className="text-lg font-black tracking-tight">Segurança e Acesso</CardTitle>
                   <CardDescription className="text-xs font-medium">Mantenha sua conta protegida com as melhores práticas</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/30 group hover:bg-muted/40 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                         <Key className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="font-black text-sm text-foreground">Alterar Senha</p>
                         <p className="text-xs text-muted-foreground font-medium">Recomendado trocar a cada 90 dias</p>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 border-border/40 hover:bg-primary/5">Alterar</Button>
                   </div>
 
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/30 group hover:bg-muted/40 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                         <Shield className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="font-black text-sm text-foreground">Autenticação em Duas Etapas</p>
                         <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[9px] mt-1 font-black uppercase tracking-widest">Ativo</Badge>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 border-border/40 hover:bg-destructive/5 hover:text-destructive">Desativar</Button>
                   </div>
                   </CardContent>
                 </Card>
 
                 <Card className="glass-card border-border/30 shadow-lg overflow-hidden">
                   <CardHeader className="border-b border-border/20 bg-muted/20">
                     <CardTitle className="text-lg font-black tracking-tight">Dispositivos Conectados</CardTitle>
                     <CardDescription className="text-xs font-medium">Sessões ativas que acessaram sua conta recentemente</CardDescription>
                   </CardHeader>
                   <CardContent className="p-0">
                     <div className="divide-y divide-border/20">
                       {activeSessions.map((session, i) => (
                         <div key={i} className="p-6 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                           <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center border",
                               session.isCurrent ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-border/20 text-muted-foreground"
                             )}>
                               <Laptop className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                 <p className="font-black text-sm text-foreground">{session.device}</p>
                                 {session.isCurrent && <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-black uppercase">Atual</Badge>}
                               </div>
                               <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                                 <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {session.location}</span>
                                 <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {session.lastActive}</span>
                               </div>
                             </div>
                           </div>
                           {!session.isCurrent && (
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 rounded-xl text-destructive font-bold text-[10px] uppercase transition-all">Encerrar</Button>
                           )}
                         </div>
                       ))}
                     </div>
                     <div className="p-4 bg-muted/10 border-t border-border/20">
                       <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-primary w-full">Encerrar todas as outras sessões</Button>
                     </div>
                   </CardContent>
                 </Card>
               </div>
 
             {/* Sidebar do Perfil */}
             <div className="space-y-6">
               <Card className="glass-card border-border/30 shadow-lg overflow-hidden">
                 <CardHeader className="border-b border-border/20 bg-muted/20">
                   <CardTitle className="text-base font-black tracking-tight">Estatísticas Operacionais</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Triagens Hoje</span>
                       <span className="font-black text-primary">12</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Acuracidade Média</span>
                       <span className="font-black text-success">98.5%</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tempo de Sessão</span>
                       <span className="font-black text-foreground">2h 45m</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
 
               <Card className="glass-card border-border/30 shadow-lg overflow-hidden">
                 <CardContent className="p-6">
                   <Button 
                     variant="ghost" 
                     className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive font-black text-xs uppercase tracking-widest"
                     onClick={signOut}
                   >
                     <LogOut className="h-5 w-5" /> 
                     Sair da Conta
                   </Button>
                 </CardContent>
               </Card>
 
               <div className="text-center space-y-1 opacity-50">
                 <p className="text-[10px] font-bold uppercase tracking-widest">ESTOKI WMS v1.0.0</p>
                 <p className="text-[9px] font-medium tracking-tight">ID do Usuário: {user?.id.slice(0, 8)}</p>
               </div>
             </div>
           </div>
         </div>
       </PageTransition>
     </AppLayout>
   );
 }
