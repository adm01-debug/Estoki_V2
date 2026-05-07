import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Wifi, WifiOff } from "lucide-react";
import { useBalanca } from "@/hooks/useBalanca";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface BalancaCardProps {
  onPesoCapturado: (peso: number) => void;
}

export function BalancaCard({ onPesoCapturado }: BalancaCardProps) {
  const { toast } = useToast();
  const {
    conectada: balancaConectada,
    leitura: leituraBalanca,
    suportado: balancaSuportada,
    conectar: conectarBalanca,
    desconectar: desconectarBalanca,
    erro: erroBalanca,
  } = useBalanca();

  useEffect(() => {
    if (leituraBalanca && leituraBalanca.estavel) {
      onPesoCapturado(leituraBalanca.peso);
      toast({
        title: "Peso capturado",
        description: `${leituraBalanca.peso} ${leituraBalanca.unidade}`,
      });
    }
  }, [leituraBalanca, onPesoCapturado, toast]);

  const handleConectar = async () => {
    try {
      await conectarBalanca();
      toast({
        title: "Balança conectada",
        description: "Pronta para leitura de peso",
      });
    } catch {
      toast({
        title: "Erro ao conectar",
        description: erroBalanca || "Não foi possível conectar à balança",
        variant: "destructive",
      });
    }
  };

  if (!balancaSuportada) return null;

  return (
    <Card className={balancaConectada ? "border-green-500" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Balança Digital</p>
              <p className="text-sm text-muted-foreground">
                {balancaConectada 
                  ? leituraBalanca 
                    ? `${leituraBalanca.peso} ${leituraBalanca.unidade} ${leituraBalanca.estavel ? '(estável)' : '(aguardando...)'}`
                    : "Aguardando leitura..."
                  : "Desconectada"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {balancaConectada ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Button variant="outline" size="sm" onClick={desconectarBalanca}>
                  Desconectar
                </Button>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <Button variant="default" size="sm" onClick={handleConectar}>
                  Conectar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
