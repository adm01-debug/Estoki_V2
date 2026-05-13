import { describe, it, expect } from 'vitest';
import { 
  validateCPF, 
  validateEmail, 
  validatePassword 
} from '../lib/validations';

describe('validations', () => {
  describe('validateEmail', () => {
    it('deve validar e-mails corretamente', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@sub.example.co.uk')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('deve validar força da senha', () => {
      // Supõe-se que exige 8+ caracteres
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('password123')).toBe(true);
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF corretamente', () => {
      // CPFs inválidos óbvios
      expect(validateCPF('11111111111')).toBe(false);
      expect(validateCPF('123')).toBe(false);
      // O CPF real depende da implementação, mas o formato deve ser 11 dígitos
    });
  });
});
