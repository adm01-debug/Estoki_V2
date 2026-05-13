import { useCRUD } from './useCRUD';

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  created_at?: string;
}

export function useStock() {
  const crud = useCRUD<StockMovement>({
    tableName: 'stock_movements',
    orderBy: { column: 'created_at', ascending: false },
  });

  return {
    ...crud,
    movements: crud.useList().data?.data || [],
  };
}
