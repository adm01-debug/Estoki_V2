import { describe, it, expect } from 'vitest';
import * as PrintComponents from './index';

describe('Print Components Index', () => {
  it('should export PrintHeader', () => {
    expect(PrintComponents.PrintHeader).toBeDefined();
  });

  it('should export PrintFooter', () => {
    expect(PrintComponents.PrintFooter).toBeDefined();
  });

  it('should export PrintLayout', () => {
    expect(PrintComponents.PrintLayout).toBeDefined();
  });

  it('should export PrintPreview', () => {
    expect(PrintComponents.PrintPreview).toBeDefined();
  });

  it('should export all print components', () => {
    const exports = Object.keys(PrintComponents);
    expect(exports.length).toBeGreaterThanOrEqual(4);
  });
});
