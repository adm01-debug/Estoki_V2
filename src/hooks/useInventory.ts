import { useCRUD } from './useCRUD';

export interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  batch_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useInventory() {
  const crud = useCRUD<InventoryItem>({
    tableName: 'inventory',
    orderBy: { column: 'updated_at', ascending: false },
  });

  return {
    ...crud,
    inventory: crud.useList().data?.data || [],
  };
}
