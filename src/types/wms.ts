// Types WMS consolidados
export interface Location {
  id: string;
  code: string;
  zone_id: string;
  aisle: string;
  rack: string;
  level: string;
  position: string;
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'staging';
  status: 'available' | 'occupied' | 'reserved' | 'blocked';
  max_weight?: number;
  max_volume?: number;
  warehouse_id: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  category_id?: string;
  unit: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  cost?: number;
  price?: number;
  reorder_point?: number;
  safety_stock?: number;
  active: boolean;
}

export interface StockMovement {
  id: string;
  product_id: string;
  location_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  lot_number?: string;
  created_by?: string;
  created_at: string;
}

export interface PickingWave {
  id: string;
  wave_number: string;
  warehouse_id: string;
  status: 'planned' | 'released' | 'in_progress' | 'completed' | 'cancelled';
  order_count: number;
  item_count: number;
  released_at?: string;
  completed_at?: string;
}

export interface CycleCount {
  id: string;
  count_number: string;
  warehouse_id: string;
  zone_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reconciled';
  scheduled_date: string;
  counted_by?: string;
  variance_count?: number;
}
