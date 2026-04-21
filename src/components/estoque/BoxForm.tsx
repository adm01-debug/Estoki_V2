import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const boxSchema = z.object({
  box: z.string().min(1, "Número do box é obrigatório").max(10),
  zona: z.string().max(20).optional(),
  capacidade_kg: z.coerce.number().min(0).max(10000).optional(),
});

type BoxFormData = z.infer<typeof boxSchema>;

interface Props {
  onSuccess: () => void;
}

export function BoxForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BoxFormData>({
    resolver: zodResolver(boxSchema),
    defaultValues: { box: "", zona: "", capacidade_kg: 500 },
  });

  const handleCreate = async (data: BoxFormData) => {
    try {
      setLoading(true);
      const codigo = `BOX-${data.box.trim().padStart(2, "0")}`;
      const { data: existing } = await supabase.from("posicoes_estoque").select("id").eq("codigo", codigo).maybeSingle();
      if (existing) {
        toast({ title: "Posição já existe", description: `O ${codigo} já está cadastrado`, variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("posicoes_estoque").insert({
        codigo, tipo: "box", box: data.box.trim(),
        zona: data.zona?.trim() || null,
        capacidade_kg: data.capacidade_kg || 500, status: "livre",
      });
      if (error) throw error;
      toast({ title: "Posição criada", description: `${codigo} cadastrado` });
      form.reset();
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultiple = async () => {
    try {
      setLoading(true);
      const boxData = form.getValues();
      const positions = [];
      for (let i = 1; i <= 24; i++) {
        const boxNum = i.toString().padStart(2, "0");
        positions.push({
          codigo: `BOX-${boxNum}`,
          tipo: "box" as const,
          box: boxNum,
          zona: boxData.zona?.trim() || null,
          capacidade_kg: boxData.capacidade_kg || 500,
          status: "livre" as const,
        });
      }
      const { error } = await supabase.from("posicoes_estoque").upsert(positions, { onConflict: "codigo", ignoreDuplicates: true });
      if (error) throw error;
      toast({ title: "Boxes criados", description: `${positions.length} boxes criados` });
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
        <FormField control={form.control} name="box" render={({ field }) => (
          <FormItem>
            <FormLabel>Número do Box</FormLabel>
            <FormControl><Input placeholder="01" maxLength={10} {...field} /></FormControl>
            <FormDescription>Será formatado como BOX-XX</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="zona" render={({ field }) => (
            <FormItem><FormLabel>Zona (opcional)</FormLabel><FormControl><Input placeholder="Picking" maxLength={20} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="capacidade_kg" render={({ field }) => (
            <FormItem><FormLabel>Capacidade (kg)</FormLabel><FormControl><Input type="number" min={0} max={10000} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Box
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={handleCreateMultiple} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar 24 Boxes
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">"Criar 24 Boxes" gera BOX-01 até BOX-24</p>
      </form>
    </Form>
  );
}
