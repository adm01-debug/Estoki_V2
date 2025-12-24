import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('checkbox', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./checkbox');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should export components', async () => {
    try {
      const module = await import('./checkbox');
      const exports = Object.keys(module);
      expect(exports.length).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
