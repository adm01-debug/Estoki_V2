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

  it('should validate CPF length', () => {
    expect(validateCPF('12345678901')).toBe(true);
    expect(validateCPF('123')).toBe(false);
  });

  it('should validate CNPJ length', () => {
    expect(validateCNPJ('12345678901234')).toBe(true);
    expect(validateCNPJ('123')).toBe(false);
  });
});
