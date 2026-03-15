import { describe, it, expect } from 'vitest';
import { STREAK_BONUSES } from '@/hooks/useStreaks';

describe('Streaks quick', () => {
  it('5 marcos', () => { expect(STREAK_BONUSES).toHaveLength(5); });
  it('dias crescentes', () => { for (let i = 1; i < STREAK_BONUSES.length; i++) expect(STREAK_BONUSES[i].dias).toBeGreaterThan(STREAK_BONUSES[i-1].dias); });
  it('30d=Mestre', () => { expect(STREAK_BONUSES[4].titulo).toBe('Mestre da Consistência'); });
});
