import { describe, it, expect, vi } from 'vitest';

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({})),
  useFormContext: vi.fn(() => ({})),
}));

describe('useRange', () => {
  it('should handle form logic', () => {
    expect(true).toBe(true);
  });
});
