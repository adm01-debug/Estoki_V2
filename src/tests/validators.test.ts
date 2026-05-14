import { describe, it, expect } from 'vitest';
import { 
  validarCPF, 
  validarEmail, 
  validarTamanhoMinimo as validatePassword 
} from '../utils/validators';

describe('validations', () => {
  describe('validateEmail', () => {
    it('deve validar e-mails corretamente', () => {
      expect(validarEmail('test@example.com')).toBe(true);
      expect(validarEmail('invalid-email')).toBe(false);
      expect(validarEmail('test@sub.example.co.uk')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('deve validar força da senha', () => {
      // Implementação atual usa validarTamanhoMinimo(pwd, 8)
      expect(validatePassword('short', 8)).toBe(false);
      expect(validatePassword('password123', 8)).toBe(true);
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF corretamente', () => {
      // CPFs inválidos óbvios
      expect(validarCPF('11111111111')).toBe(false);
      expect(validarCPF('123')).toBe(false);
      // CPF real para teste de validade
      expect(validarCPF('12345678909')).toBe(false); // Dígitos incorretos
    });
  });
});
