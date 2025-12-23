import { describe, it, expect } from 'vitest';
import { maskCPF, maskCNPJ, maskPhone, maskCEP, maskCurrency } from './masks';

describe('masks', () => {
  it('should mask CPF', () => {
    expect(maskCPF('12345678901')).toBe('123.456.789-01');
  });

  it('should mask CNPJ', () => {
    expect(maskCNPJ('12345678000190')).toBe('12.345.678/0001-90');
  });

  it('should mask phone', () => {
    expect(maskPhone('11999998888')).toBe('(11) 99999-8888');
  });

  it('should mask CEP', () => {
    expect(maskCEP('12345678')).toBe('12345-678');
  });

  it('should format currency', () => {
    expect(maskCurrency(1234.56)).toContain('1.234,56');
  });
});
