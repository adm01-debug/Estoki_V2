import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const portaPaleteSchema = z.object({
  porta_palete: z.string().min(1, "Porta-palete é obrigatório").max(10),
  secao: z.string().min(1, "Seção é obrigatória").max(10),
  nivel: z.string().min(1, "Nível é obrigatório").max(10),
  zona: z.string().max(20).optional(),
  capacidade_kg: z.coerce.number().min(0).max(10000).optional(),
});

type PortaPaleteFormData = z.infer<typeof portaPaleteSchema>;

interface Props {
  onSuccess: () => void;
}

export function PortaPaleteForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PortaPaleteFormData>({
    resolver: zodResolver(portaPaleteSchema),
    defaultValues: { porta_palete: "", secao: "", nivel: "", zona: "", capacidade_kg: 500 },
  });

  const handleCreate = async (data: PortaPaleteFormData) => {
    try {
      setLoading(true);
      const codigo = `${data.porta_palete}-${data.secao}-N${data.nivel}`;
      const { data: existing } = await supabase.from("posicoes_estoque").select("id").eq("codigo", codigo).maybeSingle();
      if (existing) {
        toast({ title: "Posição já existe", description: `A posição ${codigo} já está cadastrada`, variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("posicoes_estoque").insert({
        codigo, tipo: "porta_palete",
        porta_palete: data.porta_palete.trim(),
        secao: data.secao.trim(), nivel: data.nivel.trim(),
        zona: data.zona?.trim() || null,
        capacidade_kg: data.capacidade_kg || 500, status: "livre",
      });
      if (error) throw error;
      toast({ title: "Posição criada", description: `Porta-palete ${codigo} cadastrado` });
      form.reset();
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultiple = async () => {
    const ppData = form.getValues();
    if (!ppData.porta_palete) {
      toast({ title: "Informe o porta-palete", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const positions = [];
      const secoes = ["01", "02", "03", "04", "05", "06", "07", "08"];
      const niveis = ["1", "2", "3", "4"];
      for (const secao of secoes) {
        for (const nivel of niveis) {
          positions.push({
            codigo: `${ppData.porta_palete}-${secao}-N${nivel}`,
            tipo: "porta_palete" as const,
            porta_palete: ppData.porta_palete.trim(),
            secao, nivel,
            zona: ppData.zona?.trim() || null,
            capacidade_kg: ppData.capacidade_kg || 500,
            status: "livre" as const,
          });
        }
      }
      const { error } = await supabase.from("posicoes_estoque").upsert(positions, { onConflict: "codigo", ignoreDuplicates: true });
      if (error) throw error;
      toast({ title: "Posições criadas", description: `${positions.length} posições criadas` });
      form.reset();
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <FormField control={form.control} name="porta_palete" render={({ field }) => (
            <FormItem><FormLabel>Porta-Palete</FormLabel><FormControl><Input placeholder="PP1" maxLength={10} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="secao" render={({ field }) => (
            <FormItem><FormLabel>Seção</FormLabel><FormControl><Input placeholder="01" maxLength={10} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="nivel" render={({ field }) => (
            <FormItem><FormLabel>Nível</FormLabel><FormControl><Input placeholder="1" maxLength={10} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="zona" render={({ field }) => (
            <FormItem><FormLabel>Zona (opcional)</FormLabel><FormControl><Input placeholder="A" maxLength={20} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="capacidade_kg" render={({ field }) => (
            <FormItem><FormLabel>Capacidade (kg)</FormLabel><FormControl><Input type="number" min={0} max={10000} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Posição
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={handleCreateMultiple} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar 32 Posições
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">"Criar 32 Posições" gera 8 seções × 4 níveis</p>
      </form>
    </Form>
  );
}
