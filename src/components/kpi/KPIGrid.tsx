import { KPICard } from "./KPICard";
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface KPI { title: string; value: string | number; subtitle?: string; trend?: number; icon?: React.ReactNode; }
interface KPIGridProps { kpis: KPI[]; loading?: boolean; columns?: number; }

export function KPIGrid({ kpis, loading, columns = 4 }: KPIGridProps) {
  const gridCols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
        {[...Array(columns)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
      {kpis.map((kpi, i) => <KPICard key={i} {...kpi} />)}
    </div>
  );
}
