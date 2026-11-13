import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Hash, Search } from "lucide-react";

// Colunas reais de public.serial_numbers (migration 20260520120000): o número
// de série é `codigo` (não existe `numero_serial` nem `posicao_id`).
type Serial = {
  id: string;
  codigo: string;
  produto_id: string | null;
  lote_id: string | null;
  status: string;
  produtos?: { nome: string } | null;
};

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  disponivel: { label: "Disponível", variant: "default" },
  reservado: { label: "Reservado", variant: "secondary" },
  expedido: { label: "Expedido", variant: "outline" },
  devolvido: { label: "Devolvido", variant: "destructive" },
  descartado: { label: "Descartado", variant: "destructive" },
};

export default function SerialsPage() {
  const [search, setSearch] = useState("");

  const { data: serials = [], isLoading } = useQuery({
    queryKey: ["serial_numbers", "with_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("serial_numbers")
        .select("*, produtos(nome)")
        .order("codigo");
      if (error) throw error;
      return (data ?? []) as Serial[];
    },
  });

  const filtered = serials.filter(
    (s) =>
      s.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (s.produtos?.nome || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Hash className="h-6 w-6" />
          Seriais
        </h1>
        <p className="text-sm text-muted-foreground">Rastreamento de números de série</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por serial ou produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s: any) => {
            const cfg = STATUS_LABELS[s.status] || { label: s.status, variant: "outline" as const };
            return (
              <Card key={s.id}>
                <CardContent className="p-3">
                  <div className="mb-1 flex items-start justify-between">
                    <Hash className="h-4 w-4 text-primary" />
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="font-mono text-sm font-semibold">{s.codigo}</p>
                  {s.produtos?.nome && (
                    <p className="text-xs text-muted-foreground">{s.produtos.nome}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum serial encontrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
