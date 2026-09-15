import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Clock, Mail, Plus, Trash2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface RelatorioAgendado {
  id: string;
  nome: string;
  tipo: string;
  frequencia: string;
  destinatarios: string[];
  ativo: boolean;
  ultimo_envio: string | null;
  proximo_envio: string | null;
}

async function fetchRelatorios(): Promise<RelatorioAgendado[]> {
  const { data, error } = await supabase
    .from("relatorios_agendados")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RelatorioAgendado[]) || [];
}

export default function RelatoriosAgendados() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "estoque", frequencia: "diario", email: "" });
  const queryClient = useQueryClient();

  const { data: relatorios = [], isLoading: loading } = useQuery({
    queryKey: ["relatorios-agendados"],
    queryFn: fetchRelatorios,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["relatorios-agendados"] });

  const handleCreate = async () => {
    if (!form.nome || !form.email) {
      toast.error("Preencha nome e email");
      return;
    }
    const emails = form.email
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const proximo = new Date();
    if (form.frequencia === "diario") proximo.setDate(proximo.getDate() + 1);
    else if (form.frequencia === "semanal") proximo.setDate(proximo.getDate() + 7);
    else proximo.setMonth(proximo.getMonth() + 1);

    const { error } = await supabase.from("relatorios_agendados").insert({
      nome: form.nome,
      tipo: form.tipo,
      frequencia: form.frequencia,
      destinatarios: emails,
      proximo_envio: proximo.toISOString(),
    } as any);
    if (error) {
      toast.error("Erro ao criar relatório");
      return;
    }
    toast.success("Relatório agendado criado!");
    setDialogOpen(false);
    setForm({ nome: "", tipo: "estoque", frequencia: "diario", email: "" });
    reload();
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase
      .from("relatorios_agendados")
      .update({ ativo: !ativo } as any)
      .eq("id", id);
    reload();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("relatorios_agendados").delete().eq("id", id);
    toast.success("Relatório removido");
    reload();
  };

  const handleEnviarAgora = async (rel: RelatorioAgendado) => {
    try {
      await supabase.functions.invoke("send-email-alert", {
        body: {
          type: "scheduled_report",
          reportType: rel.tipo,
          recipients: rel.destinatarios,
          reportName: rel.nome,
        },
      });
      await supabase
        .from("relatorios_agendados")
        .update({ ultimo_envio: new Date().toISOString() } as any)
        .eq("id", rel.id);
      toast.success(`Relatório "${rel.nome}" enviado!`);
      reload();
    } catch {
      toast.error("Erro ao enviar relatório");
    }
  };

  const freqLabel: Record<string, string> = {
    diario: "Diário",
    semanal: "Semanal",
    mensal: "Mensal",
  };
  const tipoLabel: Record<string, string> = {
    estoque: "Estoque",
    triagem: "Triagem",
    recebimento: "Recebimento",
    kpis: "KPIs Operacionais",
    divergencias: "Divergências",
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📋 Relatórios Agendados</h1>
          <p className="text-sm text-muted-foreground">Envio automático de relatórios por email</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Relatório Agendado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Resumo Diário de Estoque"
                />
              </div>
              <div>
                <Label>Tipo de Relatório</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabel).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequência</Label>
                <Select
                  value={form.frequencia}
                  onValueChange={(v) => setForm((f) => ({ ...f, frequencia: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(freqLabel).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destinatários (emails separados por vírgula)</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email1@empresa.com, email2@empresa.com"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Criar Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card h-40 animate-pulse" />
          ))}
        </div>
      ) : relatorios.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum relatório agendado</p>
            <p className="text-xs text-muted-foreground/60">
              Crie um agendamento para receber relatórios automaticamente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {relatorios.map((rel, i) => (
            <motion.div
              key={rel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{rel.nome}</CardTitle>
                    <Switch
                      checked={rel.ativo}
                      onCheckedChange={() => toggleAtivo(rel.id, rel.ativo)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{tipoLabel[rel.tipo] || rel.tipo}</Badge>
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      {freqLabel[rel.frequencia] || rel.frequencia}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {rel.destinatarios.join(", ")}
                    </div>
                    {rel.ultimo_envio && (
                      <p>Último envio: {new Date(rel.ultimo_envio).toLocaleString("pt-BR")}</p>
                    )}
                    {rel.proximo_envio && (
                      <p>Próximo: {new Date(rel.proximo_envio).toLocaleString("pt-BR")}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEnviarAgora(rel)}>
                      <Send className="mr-1 h-3 w-3" />
                      Enviar Agora
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(rel.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
