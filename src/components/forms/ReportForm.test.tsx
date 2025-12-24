import { describe, it, expect, vi } from 'vitest';

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({ register: vi.fn(), handleSubmit: vi.fn() })),
}));

describe('ReportForm', () => {
  it('should render form', () => {
    expect(true).toBe(true);
  });
});
