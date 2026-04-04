import { supabase } from '@/integrations/supabase/client';
export interface Location { id: string; code: string; warehouse_id: string; zone: string; aisle: string; rack?: string; level: number; position?: string; type: 'storage' | 'picking' | 'staging' | 'receiving' | 'shipping'; status: 'available' | 'occupied' | 'reserved' | 'blocked'; max_capacity: number; current_occupancy: number; }
const from = (table: string) => (supabase.from as any)(table);
export const locationService = {
  async getAll(warehouseId?: string) { let query = from('locations').select('*'); if (warehouseId) query = query.eq('warehouse_id', warehouseId); const { data, error } = await query.order('zone').order('aisle').order('level'); if (error) throw error; return (data || []) as Location[]; },
  async getAvailable(warehouseId: string, zone?: string) { let query = from('locations').select('*').eq('warehouse_id', warehouseId).eq('status', 'available'); if (zone) query = query.eq('zone', zone); const { data, error } = await query; if (error) throw error; return (data || []) as Location[]; },
  async getById(id: string) { const { data, error } = await from('locations').select('*').eq('id', id).single(); if (error) throw error; return data as Location; },
  async create(location: Omit<Location, 'id'>) { const { data, error } = await from('locations').insert(location).select().single(); if (error) throw error; return data as Location; },
  async update(id: string, updates: Partial<Location>) { const { data, error } = await from('locations').update(updates).eq('id', id).select().single(); if (error) throw error; return data as Location; },
  async updateStatus(id: string, status: Location['status']) { return this.update(id, { status }); },
  async getUtilization(warehouseId: string) { const { data } = await from('locations').select('zone, status').eq('warehouse_id', warehouseId); const zones = [...new Set((data || []).map((l: any) => l.zone))]; return zones.map(zone => { const zoneLocations = (data || []).filter((l: any) => l.zone === zone); return { zone, total: zoneLocations.length, occupied: zoneLocations.filter((l: any) => l.status === 'occupied').length, utilization: Math.round((zoneLocations.filter((l: any) => l.status === 'occupied').length / zoneLocations.length) * 100) }; }); }
};
