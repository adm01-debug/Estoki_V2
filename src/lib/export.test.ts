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

  it('should create CSV with headers and rows', () => {
    const mockClick = vi.fn();
    const mockAppend = vi.fn();
    const mockRemove = vi.fn();
    const mockRevoke = vi.fn();

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppend);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemove);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevoke);

    exportToCSV([{ name: 'Test', value: 42 }], 'output');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevoke).toHaveBeenCalledWith('blob:test');
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
