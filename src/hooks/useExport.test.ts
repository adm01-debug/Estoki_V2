import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExport } from './useExport';

vi.mock('./use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe('useExport', () => {
  it('should have export functions', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToCSV).toBeDefined();
    expect(result.current.exportToJSON).toBeDefined();
  });
});
