import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExport } from './use-export';

// Mocking complex libraries
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    setTextColor: vi.fn(),
    save: vi.fn(),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn(),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
  }))
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      addWorksheet: vi.fn().mockImplementation(() => ({
        addRow: vi.fn(),
        getRow: vi.fn().mockReturnValue({ font: {}, fill: {} }),
        getColumn: vi.fn().mockReturnValue({ width: 0 })
      })),
      xlsx: { writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)) }
    }))
  }
}));

describe('useExport', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL and Blob for browser compatibility in tests
    if (typeof global.URL.createObjectURL === 'undefined') {
      global.URL.createObjectURL = vi.fn();
    }
    if (typeof global.URL.revokeObjectURL === 'undefined') {
      global.URL.revokeObjectURL = vi.fn();
    }
    // Note: global.Blob is already available in modern Node.js/Vitest
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.isExporting).toBe(false);
  });

  it('should expose export methods', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToPDF).toBeDefined();
    expect(result.current.exportToExcel).toBeDefined();
    expect(result.current.exportToCSV).toBeDefined();
    expect(result.current.exportToJSON).toBeDefined();
  });

  it('should handle CSV export', () => {
    const { result } = renderHook(() => useExport());
    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    
    result.current.exportToCSV(mockData);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(linkClickSpy).toHaveBeenCalled();
    
    linkClickSpy.mockRestore();
  });
});
