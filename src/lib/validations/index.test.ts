import { describe, it, expect } from 'vitest';
import { estoqueSchema, triagemSchema, recebimentoSchema, usuarioSchema } from './index';

describe('Validation Schemas', () => {
  describe('estoqueSchema', () => {
    it('should validate valid estoque', () => {
      const result = estoqueSchema.safeParse({
        codigo: 'ABC123',
        descricao: 'Produto teste',
        quantidade: 10,
        unidade: 'UN',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid estoque', () => {
      const result = estoqueSchema.safeParse({
        codigo: '',
        descricao: '',
        quantidade: -1,
        unidade: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('usuarioSchema', () => {
    it('should validate email', () => {
      const result = usuarioSchema.safeParse({
        email: 'invalid',
        nome: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });
});
