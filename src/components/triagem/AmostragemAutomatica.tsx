import { useState, useMemo } from "react";
import {
  MetodoAmostragem,
  tabelaAQL,
  getFaixaLote,
  calcularAmostraRaizQuadrada,
  calcularAmostraAQL,
  getCriteriosAceite
} from "./amostragemUtils";
import { AmostragemProgresso } from "./AmostragemProgresso";
import { AmostragemSelecao } from "./AmostragemSelecao";

interface AmostragemAutomaticaProps {
  tamanhoLote: number;
  onConfirmarAmostra: (tamanhoAmostra: number, metodo: string, criterios: { aceite: number; rejeite: number }) => void;
  itensVerificados?: number;
  defeitosEncontrados?: number;
}

export function AmostragemAutomatica({
  tamanhoLote,
  onConfirmarAmostra,
  itensVerificados = 0,
  defeitosEncontrados = 0,
}: AmostragemAutomaticaProps) {
  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoAmostragem>("aql_normal");
  const [amostraConfirmada, setAmostraConfirmada] = useState(false);
  const [tamanhoAmostraConfirmado, setTamanhoAmostraConfirmado] = useState(0);

  const calculos = useMemo(() => {
    const raizQuadrada = calcularAmostraRaizQuadrada(tamanhoLote);
    const aqlNormal = calcularAmostraAQL(tamanhoLote, "normal");
    const aqlRigoroso = calcularAmostraAQL(tamanhoLote, "rigoroso");
    const aqlReduzido = calcularAmostraAQL(tamanhoLote, "reduzido");
    const faixa = getFaixaLote(tamanhoLote);
    const letra = tabelaAQL[faixa]?.letra || "A";

    return {
      raizQuadrada,
      aqlNormal,
      aqlRigoroso,
      aqlReduzido,
      faixa,
      letra,
    };
  }, [tamanhoLote]);

  const tamanhoAmostraSelecionado = useMemo(() => {
    switch (metodoSelecionado) {
      case "raiz_quadrada":
        return calculos.raizQuadrada;
      case "aql_normal":
        return calculos.aqlNormal;
      case "aql_rigoroso":
        return calculos.aqlRigoroso;
      case "aql_reduzido":
        return calculos.aqlReduzido;
      default:
        return calculos.aqlNormal;
    }
  }, [metodoSelecionado, calculos]);

  const criterios = useMemo(() => {
    return getCriteriosAceite(tamanhoAmostraSelecionado);
  }, [tamanhoAmostraSelecionado]);

  const percentualAmostra = ((tamanhoAmostraSelecionado / tamanhoLote) * 100).toFixed(1);

  const handleConfirmar = () => {
    setAmostraConfirmada(true);
    setTamanhoAmostraConfirmado(tamanhoAmostraSelecionado);
    const metodoNome = metodoSelecionado === "raiz_quadrada" ? "Raiz Quadrada" :
      metodoSelecionado === "aql_normal" ? "AQL Normal" :
      metodoSelecionado === "aql_rigoroso" ? "AQL Rigoroso" : "AQL Reduzido";
    onConfirmarAmostra(tamanhoAmostraSelecionado, metodoNome, criterios);
  };

  const statusAmostragem = useMemo(() => {
    if (!amostraConfirmada) return "pendente";
    if (itensVerificados < tamanhoAmostraConfirmado) return "em_andamento";
    if (defeitosEncontrados > criterios.rejeite) return "rejeitado";
    if (defeitosEncontrados <= criterios.aceite) return "aprovado";
    return "limite";
  }, [amostraConfirmada, itensVerificados, tamanhoAmostraConfirmado, defeitosEncontrados, criterios]);

  if (amostraConfirmada) {
    return (
      <AmostragemProgresso
        status={statusAmostragem}
        itensVerificados={itensVerificados}
        tamanhoAmostra={tamanhoAmostraConfirmado}
        defeitosEncontrados={defeitosEncontrados}
        criterios={criterios}
      />
    );
  }

  return (
    <AmostragemSelecao
      tamanhoLote={tamanhoLote}
      metodoSelecionado={metodoSelecionado}
      setMetodoSelecionado={setMetodoSelecionado}
      calculos={calculos}
      tamanhoAmostraSelecionado={tamanhoAmostraSelecionado}
      percentualAmostra={percentualAmostra}
      criterios={criterios}
      onConfirmar={handleConfirmar}
    />
  );
}
