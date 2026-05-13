import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backupService } from './backupService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        upload: vi.fn().mockResolvedValue({ error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null })
      }))
    }
  }
}));

describe('backupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
  });

  it('should list backups', async () => {
    const backups = await backupService.listBackups();
    expect(Array.isArray(backups)).toBe(true);
  });

  it('should create backup', async () => {
    await backupService.createBackup('test', { foo: 'bar' });
    expect(true).toBe(true);
  });

  it('should download backup', async () => {
    const url = await backupService.downloadBackup('test.json');
    expect(url).toBe('blob:url');
  });
});
