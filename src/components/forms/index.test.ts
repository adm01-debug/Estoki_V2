import { describe, it, expect } from 'vitest';
import * as FormComponents from './index';

describe('Form Components Index', () => {
  it('should export multiple form components', () => {
    const exports = Object.keys(FormComponents);
    expect(exports.length).toBeGreaterThan(20);
  });

  it('should export input components', () => {
    expect(FormComponents.CurrencyInput || FormComponents.MoneyInput).toBeDefined();
  });

  it('should export picker components', () => {
    expect(FormComponents.DatePicker || FormComponents.ColorPicker).toBeDefined();
  });

  it('should export select components', () => {
    expect(FormComponents.MultiSelect || FormComponents.Combobox).toBeDefined();
  });
});
