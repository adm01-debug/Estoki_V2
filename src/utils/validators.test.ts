import { describe, it, expect } from 'vitest';
import { validateEmail, validateCNPJ, validateCPF, validateRequired } from './validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });
    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should reject empty string', () => {
      expect(validateRequired('')).toBe(false);
    });
    it('should accept non-empty string', () => {
      expect(validateRequired('test')).toBe(true);
    });
  });
});
