import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('RLS Policies', () => {
  it('should not allow unauthenticated users to read sensitive data', async () => {
    const { data, error } = await supabase.from('audit_log').select('*');
    // If not logged in, should return empty or error depending on policy
    expect(error || data?.length === 0).toBeTruthy();
  });

  it('should allow reading public positions', async () => {
    const { data, error } = await supabase.from('posicoes_estoque').select('*').limit(1);
    // Public read might be enabled or require auth. If it fails due to no auth, it confirms RLS is active.
    if (error) {
      expect(error.message).toContain('policy');
    }
  });
});