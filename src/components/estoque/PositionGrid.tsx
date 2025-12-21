import { PositionCard } from "./PositionCard";
import { Posicao } from "@/types/posicao";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { NoData } from "@/components/ui/empty-state";

interface PositionGridProps { positions: Posicao[]; loading?: boolean; onSelect?: (p: Posicao) => void; }

export function PositionGrid({ positions, loading, onSelect }: PositionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!positions.length) return <NoData />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {positions.map(p => <PositionCard key={p.id} position={p} onClick={() => onSelect?.(p)} />)}
    </div>
  );
}
