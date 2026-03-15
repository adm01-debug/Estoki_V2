import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateEmail, validateCPF, validateCNPJ } from './security';

describe('security', () => {
  it('should sanitize dangerous input', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('should validate email', () => {
    expect(validateEmail('test@test.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  it('should validate CPF with check digits', () => {
    expect(validateCPF('52998224725')).toBe(true);
    expect(validateCPF('12345678901')).toBe(false); // invalid check digits
    expect(validateCPF('123')).toBe(false);
    expect(validateCPF('11111111111')).toBe(false); // all same digits
  });

  it('should validate CNPJ with check digits', () => {
    expect(validateCNPJ('11222333000181')).toBe(true);
    expect(validateCNPJ('12345678901234')).toBe(false); // invalid check digits
    expect(validateCNPJ('123')).toBe(false);
    expect(validateCNPJ('11111111111111')).toBe(false); // all same digits
  });
});
