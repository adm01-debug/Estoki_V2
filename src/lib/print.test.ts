import { describe, it, expect } from 'vitest';
import { printElement, printTable } from './print';

describe('print', () => {
  it('should have printElement function', () => {
    expect(typeof printElement).toBe('function');
  });

  it('should have printTable function', () => {
    expect(typeof printTable).toBe('function');
  });
});
