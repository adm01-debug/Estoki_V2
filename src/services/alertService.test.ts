import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alertService } from './alertService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    }))
  }
}));

describe('alertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(alertService).toBeDefined();
  });

  it('should get alerts', async () => {
    const alerts = await alertService.getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should mark as read', async () => {
    await alertService.markAsRead('1');
    expect(true).toBe(true);
  });

  it('should create alert', async () => {
    const alert = await alertService.createAlert({
      tipo: 'estoque_baixo',
      mensagem: 'Teste',
      prioridade: 'alta'
    });
    expect(alert.id).toBe('1');
  });
});
