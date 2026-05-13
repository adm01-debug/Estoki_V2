import { useCRUD } from './useCRUD';

export interface Product {
  id: string;
  nome: string;
  sku: string;
  barcode?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export function useProducts() {
  const crud = useCRUD<Product>({
    tableName: 'produtos',
    orderBy: { column: 'nome', ascending: true },
  });

  return {
    ...crud,
    products: crud.useList().data?.data || [],
  };
}
