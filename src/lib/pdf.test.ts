import { describe, it, expect, vi } from 'vitest';

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn()
  }))
}));

import { generatePDF, downloadPDF, generateTablePDF } from './pdf';

describe('pdf', () => {
  it('should generate PDF', () => {
    const doc = generatePDF('Title', 'Content');
    expect(doc).toBeDefined();
  });

  it('should generate table PDF', () => {
    const doc = generateTablePDF('Title', ['Col1', 'Col2'], [['A', 'B']]);
    expect(doc).toBeDefined();
  });
});
