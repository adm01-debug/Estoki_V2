import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificacaoService } from './notificacaoService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

describe('notificacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('criar', () => {
    it('should create a notification', async () => {
      const result = await notificacaoService.criar({
        tipo: 'info',
        titulo: 'Teste',
        mensagem: 'Mensagem de teste',
      });
      expect(result).toBeDefined();
    });
  });

  describe('listar', () => {
    it('should list notifications', async () => {
      const result = await notificacaoService.listar('user-123');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('marcarComoLida', () => {
    it('should mark as read', async () => {
      const result = await notificacaoService.marcarComoLida('notif-123');
      expect(result).toBe(true);
    });
  });
});
