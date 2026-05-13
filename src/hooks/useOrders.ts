import { useCRUD } from './useCRUD';

export interface Order {
  id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

export function useOrders() {
  const crud = useCRUD<Order>({
    tableName: 'orders',
    orderBy: { column: 'created_at', ascending: false },
  });

  return {
    ...crud,
    orders: crud.useList().data?.data || [],
  };
}
