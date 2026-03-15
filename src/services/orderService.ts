// @ts-nocheck
import { supabase } from '@/lib/supabase';
export interface Order { id: string; order_number: string; type: 'sales' | 'purchase'; customer_id?: string; supplier_id?: string; items: { productId: string; quantity: number; unitPrice: number }[]; subtotal: number; tax?: number; shipping?: number; total: number; status: string; notes?: string; created_at: string; }
export const orderService = {
  async getAll(type?: 'sales' | 'purchase', status?: string) { let query = supabase.from('orders').select('*, customers(name), suppliers(name)'); if (type) query = query.eq('type', type); if (status) query = query.eq('status', status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return data as Order[]; },
  async getById(id: string) { const { data, error } = await supabase.from('orders').select('*').eq('id', id).single(); if (error) throw error; return data as Order; },
  async create(order: Omit<Order, 'id' | 'order_number' | 'created_at'>) { const orderNumber = `${order.type === 'sales' ? 'SO' : 'PO'}-${Date.now()}`; const { data, error } = await supabase.from('orders').insert({ ...order, order_number: orderNumber }).select().single(); if (error) throw error; return data as Order; },
  async updateStatus(id: string, status: string) { const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single(); if (error) throw error; return data as Order; },
  async cancel(id: string, reason: string) { const { data, error } = await supabase.from('orders').update({ status: 'cancelled', cancel_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', id).select().single(); if (error) throw error; return data as Order; }
};
