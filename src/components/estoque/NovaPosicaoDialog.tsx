import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Warehouse, Box, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const portaPaleteSchema = z.object({
  porta_palete: z.string().min(1, "Porta-palete é obrigatório").max(10, "Máximo 10 caracteres"),
  secao: z.string().min(1, "Seção é obrigatória").max(10, "Máximo 10 caracteres"),
  nivel: z.string().min(1, "Nível é obrigatório").max(10, "Máximo 10 caracteres"),
  zona: z.string().max(20, "Máximo 20 caracteres").optional(),
  capacidade_kg: z.coerce.number().min(0, "Capacidade não pode ser negativa").max(10000, "Máximo 10000 kg").optional(),
});

const boxSchema = z.object({
  box: z.string().min(1, "Número do box é obrigatório").max(10, "Máximo 10 caracteres"),
  zona: z.string().max(20, "Máximo 20 caracteres").optional(),
  capacidade_kg: z.coerce.number().min(0, "Capacidade não pode ser negativa").max(10000, "Máximo 10000 kg").optional(),
});

type PortaPaleteFormData = z.infer<typeof portaPaleteSchema>;
type BoxFormData = z.infer<typeof boxSchema>;

interface NovaPosicaoDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function NovaPosicaoDialog({ onSuccess, children }: NovaPosicaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"porta_palete" | "box">("porta_palete");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ppForm = useForm<PortaPaleteFormData>({
    resolver: zodResolver(portaPaleteSchema),
    defaultValues: {
      porta_palete: "",
      secao: "",
      nivel: "",
      zona: "",
      capacidade_kg: 500,
    },
  });

  const boxForm = useForm<BoxFormData>({
    resolver: zodResolver(boxSchema),
    defaultValues: {
      box: "",
      zona: "",
      capacidade_kg: 500,
    },
  });

  const handleCreatePortaPalete = async (data: PortaPaleteFormData) => {
    try {
      setLoading(true);
      
      const codigo = `${data.porta_palete}-${data.secao}-N${data.nivel}`;
      
      // Check if position already exists
      const { data: existing } = await supabase
        .from("posicoes_estoque")
        .select("id")
        .eq("codigo", codigo)
        .maybeSingle();
      
      if (existing) {
        toast({
          title: "Posição já existe",
          description: `A posição ${codigo} já está cadastrada`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("posicoes_estoque").insert({
        codigo,
        tipo: "porta_palete",
        porta_palete: data.porta_palete.trim(),
        secao: data.secao.trim(),
        nivel: data.nivel.trim(),
        zona: data.zona?.trim() || null,
        capacidade_kg: data.capacidade_kg || 500,
        status: "livre",
      });

      if (error) throw error;

      toast({
        title: "Posição criada",
        description: `Porta-palete ${codigo} cadastrado com sucesso`,
      });

      ppForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao criar posição:", err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar posição",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBox = async (data: BoxFormData) => {
    try {
      setLoading(true);
      
      const codigo = `BOX-${data.box.trim().padStart(2, "0")}`;
      
      // Check if position already exists
      const { data: existing } = await supabase
        .from("posicoes_estoque")
        .select("id")
        .eq("codigo", codigo)
        .maybeSingle();
      
      if (existing) {
        toast({
          title: "Posição já existe",
          description: `O ${codigo} já está cadastrado`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("posicoes_estoque").insert({
        codigo,
        tipo: "box",
        box: data.box.trim(),
        zona: data.zona?.trim() || null,
        capacidade_kg: data.capacidade_kg || 500,
        status: "livre",
      });

      if (error) throw error;

      toast({
        title: "Posição criada",
        description: `${codigo} cadastrado com sucesso`,
      });

      boxForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao criar box:", err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar box",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultiplePP = async () => {
    const ppData = ppForm.getValues();
    if (!ppData.porta_palete) {
      toast({ title: "Informe o porta-palete", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      
      const positions: Array<{ codigo: string; tipo: 'porta_palete'; porta_palete: string; secao: string; nivel: string; zona: string | null; capacidade_kg: number; status: 'livre' }> = [];
      const secoes = ["01", "02", "03", "04", "05", "06", "07", "08"];
      const niveis = ["1", "2", "3", "4"];
      
      for (const secao of secoes) {
        for (const nivel of niveis) {
          const codigo = `${ppData.porta_palete}-${secao}-N${nivel}`;
          positions.push({
            codigo,
            tipo: "porta_palete" as const,
            porta_palete: ppData.porta_palete.trim(),
            secao,
            nivel,
            zona: ppData.zona?.trim() || null,
            capacidade_kg: ppData.capacidade_kg || 500,
            status: "livre" as const,
          });
        }
      }

      const { error } = await supabase
        .from("posicoes_estoque")
        .upsert(positions, { onConflict: "codigo", ignoreDuplicates: true });

      if (error) throw error;

      toast({
        title: "Posições criadas",
        description: `${positions.length} posições criadas para ${ppData.porta_palete}`,
      });

      ppForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao criar posições:", err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar posições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultipleBoxes = async () => {
    try {
      setLoading(true);
      
      const boxData = boxForm.getValues();
      const positions: Array<{ codigo: string; tipo: 'box'; box: string; zona: string | null; capacidade_kg: number; status: 'livre' }> = [];
      
      for (let i = 1; i <= 24; i++) {
        const boxNum = i.toString().padStart(2, "0");
        const codigo = `BOX-${boxNum}`;
        positions.push({
          codigo,
          tipo: "box" as const,
          box: boxNum,
          zona: boxData.zona?.trim() || null,
          capacidade_kg: boxData.capacidade_kg || 500,
          status: "livre" as const,
        });
      }

      const { error } = await supabase
        .from("posicoes_estoque")
        .upsert(positions, { onConflict: "codigo", ignoreDuplicates: true });

      if (error) throw error;

      toast({
        title: "Boxes criados",
        description: `${positions.length} boxes criados com sucesso`,
      });

      boxForm.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao criar boxes:", err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar boxes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Posição
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Posição de Estoque</DialogTitle>
          <DialogDescription>
            Adicione novas posições de porta-palete ou boxes ao seu armazém
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="porta_palete" className="gap-2">
              <Warehouse className="h-4 w-4" />
              Porta-Palete
            </TabsTrigger>
            <TabsTrigger value="box" className="gap-2">
              <Box className="h-4 w-4" />
              Box
            </TabsTrigger>
          </TabsList>

          <TabsContent value="porta_palete" className="space-y-4 mt-4">
            <Form {...ppForm}>
              <form onSubmit={ppForm.handleSubmit(handleCreatePortaPalete)} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={ppForm.control}
                    name="porta_palete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porta-Palete</FormLabel>
                        <FormControl>
                          <Input placeholder="PP1" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ppForm.control}
                    name="secao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seção</FormLabel>
                        <FormControl>
                          <Input placeholder="01" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ppForm.control}
                    name="nivel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <FormControl>
                          <Input placeholder="1" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={ppForm.control}
                    name="zona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="A" maxLength={20} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ppForm.control}
                    name="capacidade_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={10000} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Posição
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={handleCreateMultiplePP}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar 32 Posições
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  "Criar 32 Posições" gera automaticamente 8 seções × 4 níveis
                </p>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="box" className="space-y-4 mt-4">
            <Form {...boxForm}>
              <form onSubmit={boxForm.handleSubmit(handleCreateBox)} className="space-y-4">
                <FormField
                  control={boxForm.control}
                  name="box"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Box</FormLabel>
                      <FormControl>
                        <Input placeholder="01" maxLength={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Será formatado como BOX-XX
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={boxForm.control}
                    name="zona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Picking" maxLength={20} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={boxForm.control}
                    name="capacidade_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={10000} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Box
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={handleCreateMultipleBoxes}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar 24 Boxes
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  "Criar 24 Boxes" gera automaticamente BOX-01 até BOX-24
                </p>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
