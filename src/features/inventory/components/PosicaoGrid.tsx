import { PosicaoCard } from "./PosicaoCard";

interface Posicao { id: string; codigo: string; status: string; tipo: string; ocupacao?: number; }

interface PosicaoGridProps {
  posicoes: Posicao[];
  onSelect?: (posicao: Posicao) => void;
  loading?: boolean;
}

export function PosicaoGrid({ posicoes, onSelect, loading }: PosicaoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {posicoes.map(posicao => (
        <PosicaoCard key={posicao.id} {...posicao} onClick={() => onSelect?.(posicao)} />
      ))}
    </div>
  );
}
