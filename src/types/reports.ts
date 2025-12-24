// Types de relatórios
export interface ReportFilter {
  start_date?: string;
  end_date?: string;
  warehouse_id?: string;
  category_id?: string;
  supplier_id?: string;
}

export interface ReportData {
  id: string;
  type: string;
  parameters: ReportFilter;
  data: Record<string, unknown>;
  generated_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface InventoryReport {
  total_items: number;
  total_quantity: number;
  total_value: number;
  by_category: { category: string; quantity: number; value: number }[];
  by_location: { location: string; quantity: number }[];
}

export interface PerformanceReport {
  period: { start: string; end: string };
  picking_performance: { avg_time: number; total_picks: number };
  receiving_performance: { avg_time: number; total_receivings: number };
  accuracy_rate: number;
}
