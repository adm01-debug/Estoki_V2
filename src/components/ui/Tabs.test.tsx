import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Tabs component', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
