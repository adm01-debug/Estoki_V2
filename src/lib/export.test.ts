import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToJSON, printContent } from './export';

// Mock DOM APIs
beforeEach(() => {
  vi.restoreAllMocks();
});

describe('exportToCSV', () => {
  it('should be defined', () => {
    expect(exportToCSV).toBeDefined();
  });

  it('should not throw on empty array', () => {
    expect(() => exportToCSV([], 'test')).not.toThrow();
  });

  it('should create and download CSV', () => {
    const mockElement = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement);
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();

    exportToCSV([{ name: 'Test', value: 42 }], 'output');
    expect(mockElement.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});

describe('exportToJSON', () => {
  it('should be defined', () => {
    expect(exportToJSON).toBeDefined();
  });
});

describe('printContent', () => {
  it('should be defined', () => {
    expect(printContent).toBeDefined();
  });

  it('should not throw when element is not found', () => {
    expect(() => printContent('nonexistent')).not.toThrow();
  });
});
