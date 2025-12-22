import { describe, it, expect, vi } from 'vitest';
import { exportToExcel, downloadFile } from './exportExcel';

describe('exportExcel', () => {
  describe('exportToExcel', () => {
    it('should create excel data', () => {
      const data = [{ name: 'Test', value: 123 }];
      const result = exportToExcel(data, 'test');
      expect(result).toBeDefined();
    });
  });
});
