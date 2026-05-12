 import { useState } from "react";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Plus, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export function NovoOndaDialog({ onSuccess }: { onSuccess: () => void }) {
   const [open, setOpen] = useState(false);
   const [saving, setSaving] = useState(false);
   const [formData, setFormData] = useState<{
     codigo: string;
     descricao: string;
     prioridade: "alta" | "baixa" | "media" | "urgente";
     zona_alvo: string;
     rota: string;
   }>({
     codigo: `ON-${Math.floor(1000 + Math.random() * 9000)}`,
     descricao: "",
     prioridade: "media",
     zona_alvo: "",
     rota: ""
   });
 
   const handleSave = async () => {
     setSaving(true);
     try {
       const { error } = await supabase
         .from("ondas_separacao")
         .insert([{
           ...formData,
           status: "pendente",
           data_criacao: new Date().toISOString(),
           total_tarefas: 0,
           tarefas_concluidas: 0
         }]);
       
       if (error) throw error;
       
       toast.success("Onda de separação criada!");
       setOpen(false);
       onSuccess();
     } catch (err) {
       toast.error("Erro ao criar onda");
     } finally {
       setSaving(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         <Button size="sm" className="gap-2">
           <Plus className="h-4 w-4" />
           <span className="hidden sm:inline">Nova Onda</span>
         </Button>
       </DialogTrigger>
       <DialogContent>
         <DialogHeader><DialogTitle>Nova Onda de Separação</DialogTitle></DialogHeader>
         <div className="space-y-4 py-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Código</Label>
               <Input value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
             </div>
             <div className="space-y-2">
               <Label>Prioridade</Label>
             <Select value={formData.prioridade} onValueChange={v => setFormData({...formData, prioridade: v as any})}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="baixa">Baixa</SelectItem>
                   <SelectItem value="media">Média</SelectItem>
                   <SelectItem value="alta">Alta</SelectItem>
                   <SelectItem value="urgente">Urgente</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <div className="space-y-2">
             <Label>Descrição</Label>
             <Input value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Pedidos E-commerce Manhã" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Zona Alvo</Label>
               <Input value={formData.zona_alvo} onChange={e => setFormData({...formData, zona_alvo: e.target.value})} placeholder="Ex: A, B, C" />
             </div>
             <div className="space-y-2">
               <Label>Rota</Label>
               <Input value={formData.rota} onChange={e => setFormData({...formData, rota: e.target.value})} placeholder="Ex: Norte" />
             </div>
           </div>
         </div>
         <DialogFooter>
           <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
           <Button onClick={handleSave} disabled={saving}>
             {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
             Criar Onda
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }